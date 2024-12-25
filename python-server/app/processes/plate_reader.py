import logging
from multiprocessing.synchronize import Event
from multiprocessing import Queue
import string
from typing import Any, Tuple

import cv2
from cv2.typing import MatLike

from app.preload import reader, license_plate_detector


# Mapping dictionaries for character conversion
dict_char_to_int = {"O": "0", "I": "1", "J": "3", "A": "4", "G": "6", "S": "5"}

dict_int_to_char = {"0": "O", "1": "I", "3": "J", "4": "A", "6": "G", "5": "S"}


def __read_license_plate(license_plate_crop: MatLike) -> Tuple[str | None, Any]:
    """
    Read the license plate text from the given cropped image.

    :param Image license_plate_crop: Cropped image containing the license plate.
    :return: Tuple containing the formatted license plate text and its confidence score.
    """

    detections = reader.readtext(license_plate_crop)

    for detection in detections:
        bbox, text, score = detection

        text = text.upper().replace(" ", "")

        if __license_complies_format(text):
            return __format_license(text), score

    return None, None


def __license_complies_format(text: str) -> bool:
    """
    Check if the license plate text complies with the required format.

    :param str text: License plate text.
    :return: True if the license plate complies with the format, False otherwise.
    """
    if len(text) != 7:
        return False

    if (
        (text[0] in string.ascii_uppercase or text[0] in dict_int_to_char.keys())
        and (text[1] in string.ascii_uppercase or text[1] in dict_int_to_char.keys())
        and (
            text[2] in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
            or text[2] in dict_char_to_int.keys()
        )
        and (
            text[3] in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
            or text[3] in dict_char_to_int.keys()
        )
        and (text[4] in string.ascii_uppercase or text[4] in dict_int_to_char.keys())
        and (text[5] in string.ascii_uppercase or text[5] in dict_int_to_char.keys())
        and (text[6] in string.ascii_uppercase or text[6] in dict_int_to_char.keys())
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
        0: dict_int_to_char,
        1: dict_int_to_char,
        4: dict_int_to_char,
        5: dict_int_to_char,
        6: dict_int_to_char,
        2: dict_char_to_int,
        3: dict_char_to_int,
    }
    for j in [0, 1, 2, 3, 4, 5, 6]:
        if text[j] in mapping[j].keys():
            license_plate_ += mapping[j][text[j]]
        else:
            license_plate_ += text[j]

    return license_plate_


def process_frame(frame: MatLike) -> list[str]:
    """
    Process the given frame by converting it to a PIL Image.

    :param MatLike frame: Frame to be processed.
    :return: PIL Image of the processed frame.
    """
    result = []

    license_plates = license_plate_detector(frame)[0]
    for license_plate in license_plates.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = license_plate

        # crop license plate
        license_plate_crop = frame[int(y1) : int(y2), int(x1) : int(x2), :]

        # process license plate
        license_plate_crop_gray = cv2.cvtColor(license_plate_crop, cv2.COLOR_BGR2GRAY)
        _, license_plate_crop_thresh = cv2.threshold(
            license_plate_crop_gray, 64, 255, cv2.THRESH_BINARY_INV
        )

        # read license plate number
        license_plate_text, _ = __read_license_plate(license_plate_crop_thresh)

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
    logger.info("Plate number recognition is running")

    while not stop_event.is_set():
        if not recognition_event.is_set():
            continue

        logger.debug("Recognizing plate numbers")
        while recognition_event.is_set() and not stop_event.is_set():
            if frame_queue.empty():
                continue

            frame = frame_queue.get()
            plate_numbers = process_frame(frame)
            [plate_number_queue.put(plate_number) for plate_number in plate_numbers]

    logger.info("Plate number recognition is stopped")
