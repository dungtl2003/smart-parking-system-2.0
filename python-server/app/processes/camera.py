import logging
from multiprocessing.synchronize import Event
import time
from datetime import datetime
from multiprocessing import Queue

import cv2


def camera_recording_task(
    stop_event: Event,
    frame_queue: Queue,
    raw_video_queue: Queue,
    length: int = 30,
    fps: float = 30.0,
) -> None:
    """
    Run the camera recording process.

    :param Event stop_event: Event to stop the process.
    :param multiprocessing.Queue frame_queue: Queue to store the frames.
    :param multiprocessing.Queue raw_video_queue: Queue to store the video files.
    :param int length: Length of the video file (in seconds).
    :param float fps: Frames per second.

    :return: None
    """
    if stop_event.is_set():
        return

    logger = logging.getLogger("uvicorn")
    logger.info("Camera recording is running")

    # Open the default camera
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        logger.error("Could not open camera")
        return

    # Get the default frame width and height
    frame_width = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Define the codec and create VideoWriter object
    fourcc = cv2.VideoWriter.fourcc(*"mp4v")

    # Initialize video writer and start time
    current_time = datetime.now().strftime("%Y%m%d%H%M%S")
    output_file = f"recording_{current_time}.mp4"
    logger.debug(f"Started new file: {output_file}")
    out = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))

    # Initialize FPS calculation
    prev_time = time.time()

    # Start recording
    last_time = time.time()

    while not stop_event.is_set():
        ret, frame = cam.read()

        if not ret:
            logger.error("Could not read frame")
            continue

        # Put the frame into the queue
        if not frame_queue.empty():
            try:
                frame_queue.get_nowait()
            except Exception:
                pass

        # Get the current time
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Write the frame to the output file
        out.write(frame)

        # Put Time (white text) on the top-right
        cv2.putText(
            frame,
            current_time,
            (frame.shape[1] - 270, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2,
        )

        # Calculate FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time

        # Put FPS (green text) on the top-left
        cv2.putText(
            frame,
            f"FPS: {fps:.2f}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2,
        )

        # Display the captured frame
        cv2.imshow("Recording", frame)

        # Stop recording after the specified length
        elapsed_time = curr_time - last_time
        if elapsed_time >= length:
            # Close the current video file
            out.release()
            logger.debug(f"Stopped recording: {output_file}")

            # Put the video file into the queue
            raw_video_queue.put((output_file, fps, length))

            # Create a new video file
            current_time = datetime.now().strftime("%Y%m%d%H%M%S")
            output_file = f"recording_{current_time}.mp4"
            out = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))
            logger.debug(f"Started new file: {output_file}")
            last_time = time.time()

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release everything if job is finished
    cam.release()
    out.release()
    cv2.destroyAllWindows()

    logger.info("Camera recording is stopped")
