import { FC, HTMLAttributes } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card as CardWrapper, CardContent } from "@/components/ui/card";
import { CheckinLog, ScannedLog } from "@/types/model";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import TableContextMenu from "@/components/common/table-context-menu";
import { getDateTimeString } from "@/utils/helpers";
import { CardScanningType } from "@/types/enum";

const columnHeaders = ["CARD ID", "LICENSE PLATE", "IN/OUT", "TIME"];

interface LogTableProps extends HTMLAttributes<HTMLTableElement> {
  logs: (CheckinLog | ScannedLog)[];
  newCardIsArrived: boolean;
}

const LogTable: FC<LogTableProps> = ({ ...props }) => {
  return (
    <CardWrapper className={cn("rounded-2xl shadow-lg", props.className)}>
      <CardContent className="flex flex-col px-4">
        <ScrollArea className="relavtive h-[58vh]">
          <Table>
            <TableHeader className="z-10 border-b-secondary-foreground border-b-2 sticky top-0 bg-white shadow-lg">
              <tr>
                {columnHeaders.map((item, key) => {
                  return (
                    <TableHead
                      key={key}
                      className="text-nowrap text-center text-black font-extrabold text-[1rem]"
                    >
                      {item}
                    </TableHead>
                  );
                })}
              </tr>
            </TableHeader>
            <TableBody>
              {props.logs.map((log, index) => (
                <TableRow key={index} className={cn("cursor-pointer")}>
                  <TableCell className="text-center text-base">
                    <TableContextMenu
                      textToCopy={log.cardId}
                      className="h-full"
                    >
                      {log.cardId}
                    </TableContextMenu>
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {log.licensePlate}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    <div
                      className={cn(
                        "bg-white relative py-2 pl-8 pr-4 shadow-lg rounded-2xl"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-2 my-auto h-3 w-3 rounded-full translate-y-1/2",
                          log.type == CardScanningType.CHECKIN
                            ? "bg-green-500"
                            : "bg-red-600"
                        )}
                      />
                      {log.type}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center text-base",
                      index === 0 && props.newCardIsArrived
                        ? "animate-pulseZoomRed"
                        : ""
                    )}
                  >
                    {getDateTimeString(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              <tr>
                <td>
                  <Separator />
                </td>
              </tr>
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </CardWrapper>
  );
};

export default LogTable;
