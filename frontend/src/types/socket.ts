import { ParkingSlot } from "./model";

export interface SocketEmitError {
  status: number;
  message?: string;
  detail?: unknown;
}

export interface ClientEvents {
  "user:join": () => void;
  "user:leave": () => void;
}

export interface ServerEvents {
  "parking-slot:update": (payload: { parkingStates: ParkingSlot[] }) => void;
}
