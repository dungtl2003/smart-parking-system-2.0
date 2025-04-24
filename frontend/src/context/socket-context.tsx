import { ClientEvents, ServerEvents } from "@/types/socket";
import { createContext, useEffect, ReactNode, useState } from "react";
import { Socket } from "socket.io-client";
import { socketInstance } from "@/config";

interface SocketContextProps {
  socket: Socket<ServerEvents, ClientEvents> | undefined;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerEvents, ClientEvents>>();

  useEffect(() => {
    socketInstance.on("connect", () => {
      setSocket(socketInstance);
    });
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext, type SocketContextProps };
