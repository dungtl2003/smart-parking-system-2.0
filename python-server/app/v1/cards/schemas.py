from enum import Enum
from pydantic import UUID4, BaseModel, ConfigDict, Field


class Card(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="cardId")
    user_id: UUID4 = Field(alias="userId")


class CardVehicle(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    card_id: str = Field(alias="cardId")
    license_plate: str = Field(alias="licensePlate")


class ValidationStatus(str, Enum):
    valid = "valid"
    invalid = "invalid"


class Response(BaseModel):
    status: ValidationStatus = Field()
