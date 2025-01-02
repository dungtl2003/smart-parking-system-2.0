import logging
import requests
import os
from multiprocessing import Queue
from multiprocessing.synchronize import Event


def video_publishing_task(
    stop_signal: Event, proceed_video_queue: Queue, url: str, keep: bool = False
) -> None:
    """
    Run the video publishing process.

    :param Event stop_signal: Event to stop the process.
    :param multiprocessing.Queue proceed_video_queue: Queue to store the video files.
    :param str url: URL to publish the video.
    :param bool keep: Keep the video file after publishing.

    :return: None
    """
    if stop_signal.is_set():
        return

    logger = logging.getLogger("uvicorn")
    logger.info("Video publishing is running")

    while not stop_signal.is_set():
        if proceed_video_queue.empty():
            continue

        proceed_video = proceed_video_queue.get()
        with open(proceed_video, "rb") as f:
            try:
                files = {"video": (proceed_video, f, "video/mp4")}
                response = requests.post(url, files=files)
                if response.status_code == 200:
                    logger.info(f"Video published: {proceed_video}")
                else:
                    logger.error(f"Failed to publish video: {proceed_video}")
                    logger.error(f"Response: {response.text}")
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to publish video: {proceed_video}, {e}")

        if not keep:
            os.remove(proceed_video)
            logger.info(f"Drop video: {proceed_video}")

    logger.info("Video publishing is stopped")
