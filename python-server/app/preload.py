import pathlib
import os
import sys

import logging
from easyocr import easyocr
from ultralytics import YOLO

from . import definitions


class Settings:
    def __init__(self):
        fetch_card_vehicle_url = os.getenv("FETCH_CARD_VEHICLE_URL")
        video_publish_url = os.getenv("VIDEO_PUBLISH_URL")
        api_route = os.getenv("API_ROUTE")
        version = os.getenv("VERSION")

        assert fetch_card_vehicle_url is not None, "FETCH_CARD_VEHICLE_URL is required"
        assert video_publish_url is not None, "VIDEO_PUBLISH_URL is required"
        assert api_route is not None, "API_ROUTE is required"
        assert version is not None, "VERSION is required"

        self.fetch_card_vehicle_url = fetch_card_vehicle_url
        self.video_publish_url = video_publish_url
        self.title = os.getenv("TITLE") or "API"
        self.version = version
        self.api_route = api_route
        self.description = os.getenv("DESCRIPTION") or "API description"
        self.debug = bool(os.getenv("DEBUG")) or False


# remember to update the path when adding new modules
def resolve_path():
    curr_directory = str(pathlib.Path(__file__).parent.resolve())

    modules = [
        str(curr_directory),
        os.path.join(curr_directory, "v1"),
        os.path.join(curr_directory, "v1", "cards"),
        os.path.join(curr_directory, "processes"),
    ]

    [sys.path.append(module) if module not in sys.path else None for module in modules]


logger = logging.getLogger("uvicorn.error")

# load models
print("Loading models")
coco_model = YOLO(os.path.join(definitions.AI_MODEL_PATH, "yolov8n.pt"))
license_plate_detector = YOLO(
    os.path.join(definitions.AI_MODEL_PATH, "license_plate_detector.pt")
)

# load easyocr
print("Loading OCR")
reader = easyocr.Reader(["en"], gpu=False)

print("Resolving path")
resolve_path()

print("Loading settings")
settings = Settings()
