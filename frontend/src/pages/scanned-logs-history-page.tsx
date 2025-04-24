import { CheckinLog, ScannedLog } from "@/types/model";
import { FC, useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { LogTable } from "@/components/scanned-card-history";
import useSocket from "@/hooks/use-socket";
import { useCurrentUser } from "@/hooks";
import { Role } from "@/types/enum";

const ScannedLogsHistory: FC = () => {
  const initData = useRouteLoaderData("scanned-logs-history") as CheckinLog[];
  const [logs, setLogs] = useState<(CheckinLog | ScannedLog)[]>(initData);
  const { socket } = useSocket();
  const [highlightFirst, setHighlightFirst] = useState<boolean>(false);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (!currentUser) return;
    const setup = async () => {
      if (currentUser.role === Role.CUSTOMER) {
        socket?.emit(`cardlist-page:join`, currentUser.userId);
      } else {
        socket?.emit(`cardlist-page-authorized:join`);
      }
    };

    const handleNewLogArrived = (payload: { log: ScannedLog }) => {
      setHighlightFirst(true);
      setTimeout(() => setHighlightFirst(false), 2000);
      setLogs((preValue) => [payload.log, ...preValue]);
    };

    //listening
    socket?.on("connect", () => {
      setup();
      // socket.emit("reconnect:sync", currentStateNumber.current);
    });
    socket?.on("card:update", handleNewLogArrived);
    setup();

    return () => {
      socket?.off(`card:update`);
      socket?.off(`connect`);
      if (currentUser.role === Role.CUSTOMER) {
        socket?.emit(`cardlist-page:leave`, currentUser.userId);
      } else {
        socket?.emit(`cardlist-page-authorized:leave`);
      }
    };
  }, []);

  return (
    <div className="my-8">
      <div className="flex gap-4 mx-auto w-xl">
        <LogTable
          logs={logs}
          newCardIsArrived={highlightFirst}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ScannedLogsHistory;
