import { ClientEvents, ServerEvents } from "@/types/socket";
import { Socket, io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_EXPRESS_SERVER_API
  ? import.meta.env.VITE_EXPRESS_SERVER_API
  : "http://127.0.0.1";
const apisPath = `${serverUrl}:${import.meta.env.VITE_API_SERVER_PORT}`;

const socketInstance: Socket<ServerEvents, ClientEvents> = io(apisPath, {
  ackTimeout: 1000,
});

export { socketInstance };
