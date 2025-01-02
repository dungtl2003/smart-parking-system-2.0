import logging
from multiprocessing.synchronize import Event
import os
import time
from datetime import datetime
from multiprocessing import Queue

import cv2


def camera_recording_task(
    stop_event: Event,
    frame_queue: Queue,
    recognition_event: Event,
    raw_video_queue: Queue,
    total_frames,
    length: int = 60,
    fps: float = 30.0,
) -> None:
    """
    Run the camera recording process.

    :param Event stop_event: Event to stop the process.
    :param multiprocessing.Queue frame_queue: Queue to store the frames.
    :param Event recognition_event: Event to start the recognition process.
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
    unfinished_video = output_file

    # Initialize FPS calculation
    prev_time = time.time()

    # Start recording
    last_time = time.time()

    # Rectangle parameters
    x, y, w, h = 320, 300, 250, 170
    color = (0, 255, 0)  # Green color
    thickness = 2  # Rectangle border thickness

    temp_total_frames = 0

    while not stop_event.is_set():
        ret, frame = cam.read()
        temp_total_frames += 1

        if not ret:
            logger.error("Could not read frame")
            continue

        extracted_region = frame[y : y + h, x : x + w]
        if recognition_event.is_set() and frame_queue.empty():
            # Put the frame into the queue
            frame_queue.put(extracted_region)

        # Get the current time
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Put Time (white text) on the top-right
        cv2.putText(
            frame,
            current_time,
            (frame.shape[1] - 270, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 192, 255),  # bgr, not rgb
            2,
        )

        # Write the frame to the output file
        out.write(frame)

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
            (50, 205, 50),  # lime
            2,
        )

        cv2.rectangle(frame, (x, y), (x + w, y + h), color, thickness)

        # Display the captured frame
        cv2.imshow("Recording", frame)

        # Stop recording after the specified length
        elapsed_time = curr_time - last_time
        if elapsed_time >= length:
            # Close the current video file
            out.release()
            logger.debug(f"Stopped recording: {output_file}")
            total_frames.value = temp_total_frames

            # Put the video file into the queue
            raw_video_queue.put((output_file, fps, length))

            # Create a new video file
            current_time = datetime.now().strftime("%Y%m%d%H%M%S")
            output_file = f"recording_{current_time}.mp4"
            out = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))
            unfinished_video = output_file
            logger.debug(f"Started new file: {output_file}")
            last_time = time.time()

            temp_total_frames = 0

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release everything if job is finished
    if os.path.exists(unfinished_video):
        logger.debug(f"Removing unfinished video: {unfinished_video}")
        os.remove(unfinished_video)

    cam.release()
    out.release()
    cv2.destroyAllWindows()

    logger.info("Camera recording is stopped")
