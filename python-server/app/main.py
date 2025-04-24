from contextlib import asynccontextmanager
import logging
from multiprocessing import Queue, Event, Process, Value
import os
import signal as kill_signal
from pydantic import BaseModel
import uvicorn
import time

from app.config import LOGGING_CONFIG
from fastapi import APIRouter, FastAPI
from app.processes.camera import camera_recording_task
from app.processes.video import video_processing_task
from app.processes.plate_reader import plate_number_recognition_task
from app.processes.publish import video_publishing_task

import app.preload as preload

processes: list[Process] = []
logger = logging.getLogger("uvicorn")
settings = preload.settings

frame_queue: Queue = Queue(maxsize=1)  # type: Tuple[MatLike, MatLike] (in, out)
raw_video_queue: Queue = Queue(maxsize=10)  # type: Tuple[str, float, float]
proceed_video_queue: Queue = Queue(maxsize=10)  # type: str
plate_number_queue: Queue = Queue(maxsize=100)  # type: list[str]
gatepos_queue: Queue = Queue(maxsize=1)  # type: list[str]
total_frames = Value("i", 0)
stop_event = Event()
recognition_event = Event()


def start_background_tasks():
    tasks = [
        (
            "camera worker",
            camera_recording_task,
            (stop_event, frame_queue, recognition_event, raw_video_queue, total_frames),
        ),
        (
            "video worker",
            video_processing_task,
            (stop_event, raw_video_queue, proceed_video_queue, total_frames),
        ),
        (
            "plate reader worker",
            plate_number_recognition_task,
            (
                stop_event,
                recognition_event,
                frame_queue,
                plate_number_queue,
                gatepos_queue,
            ),
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


class RequestBody(BaseModel):
    plate_number: str
    gate_pos: str


@api_router.post("/validate-car-plate")
async def validate_car_plate(body: RequestBody, timeout: int = 5000) -> dict[str, str]:
    """
    Validate a car plate number

    :param RequestBody body: Request body
    :param int timeout: Timeout in milliseconds

    :return: Validation status
    :rtype: dict[str, str]
    """
    plate_number = body.plate_number
    gate_pos = body.gate_pos
    logger.info(f"Validating plate number: {plate_number}, gate position: {gate_pos}")
    start = time.time()

    logger.debug("Setting recognition event")
    gatepos_queue.put(gate_pos)
    recognition_event.set()
    response = {"status": "invalid"}
    while time.time() - start < timeout / 1000:
        if plate_number_queue.empty():
            continue

        plate_numbers = plate_number_queue.get()
        if plate_number in plate_numbers:
            logger.info(f"Plate number {plate_number} is valid")
            response = {"status": "valid"}
            break

    logger.debug("Clearing recognition event")
    recognition_event.clear()

    logger.info(f"Returning response: {response}")
    return response


app.include_router(api_router)


@app.get("/ping")
async def ping():
    logger.info("Ping")
    return {"ping": "pong"}


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_config=LOGGING_CONFIG)


if __name__ == "__main__":
    main()
