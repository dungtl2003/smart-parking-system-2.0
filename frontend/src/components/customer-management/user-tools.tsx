import { FC, HTMLAttributes } from "react";
import { Card as CardContainer, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Card, Customer } from "@/types/model";
import CustomerDeleteAlertDialog from "./customer-delete-dialog";
import { ActionResult } from "@/types/component";
import ViewVehiclesDialog from "./view-vehicles-dialog";
import { Car, Plus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  CustomerAdditionFormProps,
  CustomerEditionFormProps,
} from "@/utils/schema";
import CustomerAdditionDialog from "./customer-addition-dialog";
import CustomerEditionDialog from "./customer-edition-dialog";

interface UserToolsProps extends HTMLAttributes<HTMLDivElement> {
  selectedCustomer: Customer | undefined;
  cards: Card[];
  handleDeleteCustomer: () => Promise<ActionResult>;
  handleUpdateCustomer: (
    data: CustomerEditionFormProps
  ) => Promise<ActionResult>;
  handleAddCustomer: (data: CustomerAdditionFormProps) => Promise<ActionResult>;
  onUpdateCustomerAttribute: (customer: Customer) => void;
}

const CustomerToolBar: FC<UserToolsProps> = ({ ...props }) => {
  return (
    <CardContainer className={cn("rounded-xl shadow-lg", props.className)}>
      <CardContent className="p-4 space-y-4 flex flex-col">
        {/** add button */}
        <CustomerAdditionDialog onSave={props.handleAddCustomer}>
          <Button variant="positive" className="text-xl">
            <Plus />
          </Button>
        </CustomerAdditionDialog>

        {props.selectedCustomer ? (
          <>
            <CustomerEditionDialog
              customer={props.selectedCustomer}
              onSave={props.handleUpdateCustomer}
            >
              <Button variant="neutral">
                <SquarePen />
              </Button>
            </CustomerEditionDialog>

            <CustomerDeleteAlertDialog
              onDeleteCustomer={props.handleDeleteCustomer}
            >
              <Button variant="negative">
                <Trash2 />
              </Button>
            </CustomerDeleteAlertDialog>

            <ViewVehiclesDialog
              availableCards={props.cards}
              onUpdate={props.onUpdateCustomerAttribute}
              customer={props.selectedCustomer}
            >
              <Button variant="destructive">
                <Car />
              </Button>
            </ViewVehiclesDialog>
          </>
        ) : (
          <>
            <SquarePen className="mx-4 !mt-6" />
            <Trash2 className="mx-4 !mt-6" />
            <Car className="mx-4 !mt-6" />
          </>
        )}
      </CardContent>
    </CardContainer>
  );
};

export default CustomerToolBar;
