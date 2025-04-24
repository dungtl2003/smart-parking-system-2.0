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
    userId: string;
}

export interface ScannedLog {
    cardId: string;
    licensePlate: string;
    type: CardScanningType;
    createdAt: Date;
}

export interface ClientEvents {
    "user:join": () => void;
    "user:leave": () => void;
    "reconnect:sync": (latestId: number) => void;
    "cardlist-page:join": (userId: string) => void;
    "cardlist-page:leave": (userId: string) => void;
    "cardlist-page-authorized:join": () => void;
    "cardlist-page-authorized:leave": () => void;
}

export interface ServerEvents {
    "parking-slot:update": (
        payload: {parkingStates: ParkingSlot[]},
        offSet: number
    ) => void;
    "card:update": (payload: {log: ScannedLog}) => void;
}
