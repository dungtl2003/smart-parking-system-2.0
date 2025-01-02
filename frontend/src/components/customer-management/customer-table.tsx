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
import { Customer } from "@/types/model";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { userService } from "@/services";

const columnHeaders = ["", "CUSTOMER", "REGISTERED DATE", "STATUS"];

interface CustomerTableProps extends HTMLAttributes<HTMLTableElement> {
  customers: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
}

const CustomerTable: FC<CustomerTableProps> = ({ ...props }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    props.onSelectCustomer && props.onSelectCustomer(customer);
  };

  return (
    <Card className={cn("rounded-2xl shadow-lg", props.className)}>
      <CardHeader className="py-6">
        <CardTitle className="text-8">CUSTOMER LIST</CardTitle>
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
              {props.customers.map((customer, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "cursor-pointer",
                    selectedCustomer?.userId === customer.userId &&
                      "bg-slate-200"
                  )}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <TableCell className="text-center text-base">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {customer.username}
                  </TableCell>
                  <TableCell className="text-center text-base 2xl_text-nowrap">
                    {formatDateTime(`${customer.createdAt}`)}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    <span
                      className={cn(
                        "bg-white relative py-2 pl-8 pr-4 shadow-lg rounded-2xl"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-2 h-3 w-3 rounded-full translate-y-1/2",
                          userService.isActive(customer)
                            ? "bg-green-500"
                            : "bg-red-600"
                        )}
                      />
                      {userService.isActive(customer)
                        ? "Activate"
                        : "Inactivate"}
                    </span>
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

export default CustomerTable;
