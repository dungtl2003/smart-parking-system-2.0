import { CheckinLog } from "@/types/model";
import { FC, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { LogTable } from "@/components/scanned-card-history";
import { scannedLogsService } from "@/services";
import { Button } from "@/components/ui/button";
import { IoIosRefresh } from "react-icons/io";
import { LoadingSpinner } from "@/components/effect";

const ScannedLogsHistory: FC = () => {
  const initData = useRouteLoaderData("scanned-logs-history") as CheckinLog[];
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [logs, setLogs] = useState<CheckinLog[]>(initData);

  const handleRefreshButtonOnClick = async () => {
    setIsSubmitting(true);
    const result = await scannedLogsService.apis.getLogs();
    setIsSubmitting(false);
    setLogs(result);
  };

  return (
    <div className="my-8">
      <div className="flex gap-4 mx-auto w-xl">
        <LogTable logs={logs} className="flex-1" />
        <Button
          className="p-2 rounded-full hover_text-black"
          onClick={handleRefreshButtonOnClick}
        >
          {isSubmitting ? (
            <LoadingSpinner size={25} className="text-white" />
          ) : (
            <IoIosRefresh size={25} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ScannedLogsHistory;
