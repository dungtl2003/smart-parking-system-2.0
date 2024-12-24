import logging
import requests
import os
from multiprocessing import Queue
from multiprocessing.synchronize import Event


def video_publishing_task(stop_signal: Event, proceed_video_queue: Queue, url: str):
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
                files = {"video": f}
                response = requests.post(url, files=files)
                if response.status_code == 200:
                    logger.info(f"Video published: {proceed_video}")
                else:
                    logger.error(f"Failed to publish video: {proceed_video}")
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to publish video: {proceed_video}, {e}")

            os.remove(proceed_video)
            logger.info(f"Drop video: {proceed_video}")

    logger.info("Video publishing is stopped")
