import type {CardScanningType, ParkingSlot, UserRole} from "@prisma/client";

export interface UserDTO {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

export interface UserInToken {
    userId: string;
    username: string;
    role: UserRole;
}

export interface CardVehicle {
    cardId: string;
    licensePlate: string;
    username: string;
}

export interface CardInOut {
    cardId: string;
    type: CardScanningType;
    time: Date;
}

export interface ClientEvents {
    "user:join": () => void;
    "user:leave": () => void;
    "reconnect:sync": (latestId: number) => void;
    "cardlist-page:join": () => void;
    "cardlist-page:leave": () => void;
}

export interface ServerEvents {
    "parking-slot:update": (
        payload: {parkingStates: ParkingSlot[]},
        offSet: number
    ) => void;
    "card:update": (payload: {card: CardInOut}) => void;
}
