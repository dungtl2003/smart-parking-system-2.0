import { CardInOut, ParkingSlot } from "./model";

export interface SocketEmitError {
  status: number;
  message?: string;
  detail?: unknown;
}

export interface ClientEvents {
  "user:join": () => void;
  "user:leave": () => void;
  "reconnect:sync": (serverOffset: number) => void;
  "cardlist-page:join": () => void;
  "cardlist-page:leave": () => void;
}

export interface ServerEvents {
  "parking-slot:update": (
    payload: { parkingStates: ParkingSlot[] },
    offSet: number
  ) => void;
  "card:update": (payload: { card: CardInOut }) => void;
}
