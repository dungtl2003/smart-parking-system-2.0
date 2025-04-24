import { FC, HTMLAttributes, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/utils/helpers";
import { Staff } from "@/types/model";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

const columnHeaders = ["", "STAFF", "EMAIL", "REGISTERED DATE"];

interface StaffTableProps extends HTMLAttributes<HTMLTableElement> {
  staffs: Staff[];
  onSelectStaff?: (staff: Staff) => void;
}

const StaffTable: FC<StaffTableProps> = ({ ...props }) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();

  const handleSelectedStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    props.onSelectStaff && props.onSelectStaff(staff);
  };

  return (
    <Card className={cn("rounded-2xl shadow-lg", props.className)}>
      <CardHeader className="py-6">
        <CardTitle className="text-8">STAFF LIST</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col px-4">
        <ScrollArea className="relavtive h-[58vh] pr-3 pb-3">
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
              {props.staffs.map((staff, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "cursor-pointer",
                    selectedStaff?.userId === staff.userId && "bg-slate-200"
                  )}
                  onClick={() => handleSelectedStaff(staff)}
                >
                  <TableCell className="text-center text-base">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {staff.username}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {staff.email}
                  </TableCell>
                  <TableCell className="text-center text-base 2xl_text-nowrap">
                    {formatDateTime(`${staff.createdAt}`)}
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
    </Card>
  );
};

export default StaffTable;
