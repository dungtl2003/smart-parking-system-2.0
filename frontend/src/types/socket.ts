import { ParkingSlot, ScannedLog } from "./model";

export interface SocketEmitError {
  status: number;
  message?: string;
  detail?: unknown;
}

export interface ClientEvents {
  "user:join": () => void;
  "user:leave": () => void;
  "reconnect:sync": (serverOffset: number) => void;
  "cardlist-page:join": (userId: string) => void;
  "cardlist-page:leave": (userId: string) => void;
  "cardlist-page-authorized:join": () => void;
  "cardlist-page-authorized:leave": () => void;
}

export interface ServerEvents {
  "parking-slot:update": (
    payload: { parkingStates: ParkingSlot[] },
    offSet: number
  ) => void;
  "card:update": (payload: { log: ScannedLog }) => void;
}
