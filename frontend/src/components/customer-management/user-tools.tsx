import { FC, HTMLAttributes } from "react";
import { Card as CardContainer, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Card, Customer } from "@/types/model";
import CustomerDialog from "./customer-action-dialog";
import { CustomerFormProps } from "@/utils/schema";
import CustomerDeleteAlertDialog from "./customer-delete-dialog";
import { ActionResult } from "@/types/component";
import ViewVehiclesDialog from "./view-vehicles-dialog";
import { Car, Plus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface UserToolsProps extends HTMLAttributes<HTMLDivElement> {
  selectedCustomer: Customer | undefined;
  cards: Card[];
  handleDeleteCustomer: () => Promise<ActionResult>;
  handleUpdateCustomer: (data: CustomerFormProps) => Promise<ActionResult>;
  handleAddCustomer: (data: CustomerFormProps) => Promise<ActionResult>;
  onUpdateCustomerAttribute: (customer: Customer) => void;
}

const CustomerToolBar: FC<UserToolsProps> = ({ ...props }) => {
  return (
    <CardContainer className={cn("rounded-xl shadow-lg", props.className)}>
      <CardContent className="p-4 space-y-4 flex flex-col">
        {/** add button */}
        <CustomerDialog type="Add" onSave={props.handleAddCustomer}>
          <Button variant="positive" className="text-xl">
            <Plus />
          </Button>
        </CustomerDialog>

        {props.selectedCustomer ? (
          <>
            <CustomerDialog
              type="Edit"
              customer={props.selectedCustomer}
              onSave={props.handleUpdateCustomer}
            >
              <Button variant="neutral">
                <SquarePen />
              </Button>
            </CustomerDialog>

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
