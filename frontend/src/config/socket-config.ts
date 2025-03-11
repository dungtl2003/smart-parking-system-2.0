import { ClientEvents, ServerEvents } from "@/types/socket";
import { Socket, io } from "socket.io-client";

const localHost = "http://192.168.1.54";
const serverUrl =
  import.meta.env.VITE_API_SERVER_URL ||
  `${localHost}:${import.meta.env.VITE_API_SERVER_PORT}`;

const socketInstance: Socket<ServerEvents, ClientEvents> = io(serverUrl, {
  ackTimeout: 1000,
});

export { socketInstance };
