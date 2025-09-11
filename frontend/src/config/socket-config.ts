import { ClientEvents, ServerEvents } from "@/types/socket";
import { Socket, io } from "socket.io-client";

const serverDomain = `${import.meta.env.VITE_EXPRESS_SERVER_API ?? `http://127.0.0.1`}:${import.meta.env.VITE_API_SERVER_PORT}`;

const socketInstance: Socket<ServerEvents, ClientEvents> = io(serverDomain, {
  ackTimeout: 1000,
});

export { socketInstance };
