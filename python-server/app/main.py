from contextlib import asynccontextmanager
from multiprocessing import Queue, Event, Process
import os
import signal as kill_signal
import uvicorn

from app.v1.cards.schemas import Response as CardValidationResponse
from app.v1.cards import services as card_services
from app.config import LOGGING_CONFIG
from fastapi import APIRouter, FastAPI
from app.processes.camera import camera_recording_task
from app.processes.video import video_processing_task
from app.processes.plate_reader import plate_number_recognition_task
from app.processes.publish import video_publishing_task

import app.preload as preload

processes: list[Process] = []
logger = preload.logger
settings = preload.settings

frame_queue: Queue = Queue(maxsize=1)  # type: MatLike
raw_video_queue: Queue = Queue(maxsize=10)  # type: Tuple[str, float, float]
proceed_video_queue: Queue = Queue(maxsize=10)  # type: str
plate_number_queue: Queue = Queue(maxsize=100)  # type: list[str]
stop_event = Event()
recognition_event = Event()


def start_background_tasks():
    tasks = [
        (
            "camera worker",
            camera_recording_task,
            (stop_event, frame_queue, raw_video_queue),
        ),
        (
            "video worker",
            video_processing_task,
            (stop_event, raw_video_queue, proceed_video_queue),
        ),
        (
            "plate reader worker",
            plate_number_recognition_task,
            (stop_event, recognition_event, frame_queue, plate_number_queue),
        ),
        (
            "video publisher",
            video_publishing_task,
            (stop_event, proceed_video_queue, settings.video_publish_url),
        ),
    ]

    for name, fn, args in tasks:
        p = Process(name=name, target=fn, args=args, daemon=True)
        processes.append(p)
        p.start()


def end_background_tasks():
    stop_event.set()
    for p in processes:
        logger.info(f"Terminating process: {p}")
        p.join(5)
        if p.is_alive():
            logger.error(f"Could not terminate process: {p}, process to force kill it")
            if p.pid:
                os.kill(p.pid, kill_signal.SIGKILL)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting background tasks")
    start_background_tasks()
    yield
    logger.info("Ending background tasks")
    end_background_tasks()


app = FastAPI(
    debug=settings.debug,
    title=settings.title,
    description=settings.description,
    version=settings.version,
    lifespan=lifespan,
)

api_router = APIRouter(prefix=settings.api_route)


@api_router.get("/cards/validate")
async def validate_card(timeout: int = 5000) -> CardValidationResponse:
    """
    Validate a card

    :param int timeout: Timeout in seconds
    :return: Validation status

    """
    logger.info("Validating card")
    card_validation_response = await card_services.validate_card(
        settings.fetch_card_vehicle_url, plate_number_queue, timeout
    )
    return card_validation_response


@app.get("/ping")
async def ping():
    logger.info("Ping")
    return {"ping": "pong"}


def main():
    app.include_router(api_router)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_config=LOGGING_CONFIG)


if __name__ == "__main__":
    main()
