import { SocketContext, SocketContextProps } from "@/context";
import { useContext } from "react";

const useSocket = (): SocketContextProps => {
  const socketContext = useContext(SocketContext);

  if (!socketContext) {
    throw new Error("useSocket must be used within an SocketProvider");
  }

  return socketContext;
};

export default useSocket;
