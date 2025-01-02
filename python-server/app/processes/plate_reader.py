import logging
from multiprocessing.synchronize import Event
from multiprocessing import Queue
import string
from typing import Any, Tuple

from cv2.typing import MatLike
import easyocr
from easyocr.easyocr import os
from ultralytics import YOLO

from app import definitions


# Mapping dictionaries for character conversion
dict_char_to_int = {"D": "0", "I": "1", "J": "3", "A": "4", "G": "6", "S": "5"}

dict_int_to_char = {
    "0": "D",
    "1": "I",
    "3": "J",
    "4": "A",
    "6": "G",
    "5": "S",
    "8": "B",
}


def __read_license_plate(
    reader: easyocr.Reader, license_plate_crop: MatLike
) -> Tuple[str | None, Any]:
    """
    Read the license plate text from the given cropped image.
    The format will be: [0-9][0-9][A-Z][0-9][0-9][0-9][0-9][0-9]
    Example: 12A34567

    :param Image license_plate_crop: Cropped image containing the license plate.
    :return: Tuple containing the formatted license plate text and its confidence score.
    """

    detections = reader.readtext(license_plate_crop)

    for detection in detections:
        bbox, text, score = detection

        print(f"Text: {text}, Score: {score}")
        text = (
            text.upper()
            .replace(" ", "")
            .replace(".", "")
            .replace("-", "")
            .replace("_", "")
        )

        if __license_complies_format(text):
            formatted_text = __format_license(text)
            print(f"Processed Text: {formatted_text}")
            return formatted_text, score

    return None, None


def __is_car_number(text: str) -> bool:
    """
    Check if the given text is a car number.

    :param str text: Text to be checked.
    :return: True if the text is a car number, False otherwise.
    """
    if (
        text in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        or text in dict_char_to_int.keys()
    ):
        return True

    return False


def __is_car_letter(text: str) -> bool:
    """
    Check if the given text is a car letter.

    :param str text: Text to be checked.
    :return: True if the text is a car letter, False otherwise.
    """
    if text in string.ascii_uppercase or text in dict_int_to_char.keys():
        return True

    return False


def __license_complies_format(text: str) -> bool:
    """
    Check if the license plate text complies with the required format.

    :param str text: License plate text.
    :return: True if the license plate complies with the format, False otherwise.
    """
    if len(text) != 8:
        return False

    if (
        __is_car_number(text[0])
        and __is_car_number(text[1])
        and __is_car_letter(text[2])
        and __is_car_number(text[3])
        and __is_car_number(text[4])
        and __is_car_number(text[5])
        and __is_car_number(text[6])
        and __is_car_number(text[7])
    ):
        return True
    else:
        return False


def __format_license(text: str) -> str:
    """
    Format the license plate text by converting characters using the mapping dictionaries.

    :param str text: License plate text.
    :return: Formatted license plate text.
    """
    license_plate_ = ""
    mapping = {
        0: dict_char_to_int,
        1: dict_char_to_int,
        2: dict_int_to_char,
        3: dict_char_to_int,
        4: dict_char_to_int,
        5: dict_char_to_int,
        6: dict_char_to_int,
        7: dict_char_to_int,
    }
    for j in [0, 1, 2, 3, 4, 5, 6, 7]:
        if text[j] in mapping[j].keys():
            license_plate_ += mapping[j][text[j]]
        else:
            license_plate_ += text[j]

    return license_plate_


def process_frame(
    reader: easyocr.Reader, license_plate_detector: YOLO, frame: MatLike
) -> list[str]:
    """
    Process the given frame by converting it to a PIL Image.

    :param MatLike frame: Frame to be processed.
    :return: PIL Image of the processed frame.
    """
    logger = logging.getLogger("uvicorn")
    result = []

    license_plates = license_plate_detector(frame)[0]
    for license_plate in license_plates.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = license_plate

        # crop license plate
        license_plate_crop = frame[int(y1) : int(y2), int(x1) : int(x2), :]

        # read license plate number
        license_plate_text, _ = __read_license_plate(reader, license_plate_crop)

        if license_plate_text is not None:
            result.append(license_plate_text)

    return result


def plate_number_recognition_task(
    stop_event: Event,
    recognition_event: Event,
    frame_queue: Queue,
    plate_number_queue: Queue,
) -> None:
    """
    Run the plate number recognition process.

    :param Event stop_event: Event to stop the process.
    :param Event recognition_event: Event to start the recognition process.
    :param multiprocessing.Queue frame_queue: Queue to store the latest frame.
    :param multiprocessing.Queue plate_number_queue: Queue to store the plate numbers.

    :return: None
    """
    if stop_event.is_set():
        return

    logger = logging.getLogger("uvicorn")

    # load models
    logger.info("Loading models")
    license_plate_detector = YOLO(
        os.path.join(definitions.AI_MODEL_PATH, "license_plate_detector.pt")
    )

    # load easyocr
    logger.info("Loading easyocr")
    reader = easyocr.Reader(["en"], gpu=False)
    logger.info("Plate number recognition is running")

    while not stop_event.is_set():
        if not recognition_event.is_set():
            if not plate_number_queue.empty():
                plate_number_queue.get()
            continue

        logger.debug("Recognizing plate numbers")
        while recognition_event.is_set() and not stop_event.is_set():
            if frame_queue.empty():
                continue

            try:
                frame = frame_queue.get()
                plate_numbers = process_frame(reader, license_plate_detector, frame)
                [plate_number_queue.put(plate_number) for plate_number in plate_numbers]
            except Exception as e:
                logger.error(f"Could not recognize plate number: {e}")

    logger.info("Plate number recognition is stopped")
