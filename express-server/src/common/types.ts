import type {ParkingSlot, UserRole} from "@prisma/client";

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

export interface ClientEvents {
    "user:join": () => void;
    "user:leave": () => void;
}

export interface ServerEvents {
    "parking-slot:update": (payload: {parkingStates: ParkingSlot[]}) => void;
}
