import logging
from multiprocessing import Queue
import time
import os
from multiprocessing.synchronize import Event

import ffmpeg


def get_video_duration(file: str) -> float:
    """Get the duration of a video file."""
    try:
        probe = ffmpeg.probe(file)
        duration = float(probe["format"]["duration"])
        return duration
    except KeyError:
        raise ValueError("Could not retrieve duration from the file.")
    except ffmpeg.Error as e:
        raise RuntimeError(f"FFmpeg error: {e.stderr.decode('utf-8')}")


def process_video_file(video_file: str, expected_duration: float, total_frames: int):
    logger = logging.getLogger("uvicorn")

    if not os.path.isfile(video_file):
        logger.error(f"File not found: {video_file}")

    video_duration = get_video_duration(video_file)

    actual_fps = total_frames / video_duration
    duration_ratio = expected_duration / video_duration

    temp_output_file = f"temp_{video_file}"

    logger.debug(f"Processing video: {video_file}")
    (
        ffmpeg.input(video_file)
        .filter("setpts", f"{duration_ratio}*PTS")  # Apply the setpts filter
        .filter("fps", fps=actual_fps)  # Set the output frame rate
        .output(
            vcodec="libx264",
            acodec="aac",
            shortest=None,
            threads=16,
            filename=temp_output_file,
        )
        .overwrite_output()  # Equivalent to -y
        .run()
    )

    os.remove(video_file)
    os.rename(temp_output_file, video_file)


def video_processing_task(
    stop_event: Event,
    raw_video_queue: Queue,
    proceed_video_queue: Queue,
    total_frames,
) -> None:
    """
    Run the video processing process.

    :param Event stop_event: Event to stop the process.
    :param Queue raw_video_queue: Queue to get the video files to process.

    :return: None
    """
    if stop_event.is_set():
        return

    logger = logging.getLogger("uvicorn")
    logger.info("Video processing is running")

    while not stop_event.is_set():
        if not raw_video_queue.empty():
            video_file, expected_fps, expected_duration = raw_video_queue.get()

            try:
                process_video_file(video_file, expected_duration, total_frames.value)

                if proceed_video_queue.full():
                    logger.warning(
                        "Proceed video queue is full, dropping the oldest video"
                    )
                    old_video = proceed_video_queue.get()
                    os.remove(old_video)
                    logger.info(f"Dropped video: {old_video}")

                proceed_video_queue.put(video_file)
                logger.info(f"Processed video: {video_file}")
            except Exception as e:
                logger.error(f"Error processing video: {video_file} - {e}")
        else:
            time.sleep(0.1)

    logger.info("Video processing is stopped")
