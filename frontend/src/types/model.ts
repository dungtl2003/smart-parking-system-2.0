import { CardScanningType, Role, SlotStatus } from "@/types/enum";

export type Card = {
  cardId: string;
  cardCode: string;
  name: string;
  userId: string | null;
  user?: User;
  lastCheckinTime: Date | null;
  lastCheckoutTime: Date | null;
};

export type User = {
  userId: string;
  username: string;
  email: string;
  role: Role;
};

export interface Customer extends User {
  createdAt: Date;
  vehicles: Vehicle[];
  cards: Card[];
}

export interface Staff extends User {
  createdAt: Date;
}

export type Vehicle = {
  vehicleId: string;
  cardId: string;
  userId: string;
  createdAt: Date;
  licensePlate: string;
  card?: Card;
};

export type ParkingSlot = {
  slotId: number;
  state: SlotStatus;
};

export type Video = {
  videoId: string;
  createdAt: string;
  url: string;
};

export interface CardInOut {
  cardId: string;
  type: CardScanningType;
  time: Date;
}

export interface CheckinLog {
  id: string;
  cardId: string;
  licensePlate: string;
  type: CardScanningType;
  createdAt: Date;
}
