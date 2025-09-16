import { ClientEvents, ServerEvents } from "@/types/socket";
import { Socket, io } from "socket.io-client";

const socketInstance: Socket<ServerEvents, ClientEvents> = io(
  `${import.meta.env.VITE_EXPRESS_SERVER_API}`,
  {
    ackTimeout: 1000,
  }
);

export { socketInstance };
