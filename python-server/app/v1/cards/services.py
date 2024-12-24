from datetime import datetime, timedelta, timezone
import logging
import requests

from torch import multiprocessing
from .schemas import CardVehicle, Response, ValidationStatus


def fetch_card_data(url: str) -> list[CardVehicle] | None:
    logger = logging.getLogger("uvicorn")
    try:
        logger.debug(f"Fetching card data from {url}")
        response = requests.get(url)
        if response.status_code != 200:
            logger.error(f"Failed to fetch card data from {url}")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch card data from {url}, {e}")
        return None

    json_data = response.json()
    return [CardVehicle(**data) for data in json_data]


async def validate_card(
    url: str, plate_number_queue: multiprocessing.Queue, timeout: int = 5
) -> Response:
    """
    Validate a card

    :param int timeout: Timeout in seconds
    :return: Validation status

    """
    logger = logging.getLogger("uvicorn")
    start = datetime.now(timezone.utc)
    card_data: list[CardVehicle] | None = None

    while (datetime.now(timezone.utc) - start) < timedelta(seconds=timeout):
        if card_data is None:
            card_data = fetch_card_data(url)
            continue

        if plate_number_queue.empty():
            continue

        plate_numbers = plate_number_queue.get()
        for card in card_data:
            if card.license_plate in plate_numbers:
                logger.debug(f"Card with license plate {card.license_plate} is valid")
                return Response(status=ValidationStatus.valid)

    return Response(status=ValidationStatus.invalid)
