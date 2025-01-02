import { HTMLAttributes, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "../ui/separator";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Card, Customer, Vehicle } from "@/types/model";
import { formatDateTime } from "@/utils/helpers";
import vehicleService from "@/services/vehicle";
import VehicleActionDialog from "./vehicle-action-dialog";
import { Button } from "../ui/button";
import { ActionResult } from "@/types/component";
import axios, { HttpStatusCode } from "axios";
import VehicleDeleteAlertDialog from "./delete-vehicle-alert-dialog";
import { cardService, userService } from "@/services";

const columnHeaders = [
  "",
  "LICENSE PLATE",
  "REGISTERED DATE",
  "ATTACHED CARD'S NAME",
];

interface VehicleDialogProps extends HTMLAttributes<HTMLDivElement> {
  cards: Card[];
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

const ViewVehiclesDialog: React.FC<VehicleDialogProps> = ({
  className,
  ...props
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>();
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    vehicleService.getVehiclesFromCustomer(props.customer)
  );

  useEffect(() => {
    setVehicles(vehicleService.getVehiclesFromCustomer(props.customer));
  }, [props.customer]);

  const handleAddVehicle = async (data: {
    licensePlate: string;
    cardId: string;
  }): Promise<ActionResult> => {
    try {
      const createdVehicle = await vehicleService.apis.addVehicle(
        data,
        props.customer.userId
      );

      const newVehicles = vehicleService.addVehicle(createdVehicle, vehicles);
      const customerNewCardList = cardService.addCard(
        createdVehicle.card!,
        props.customer.cards
      );
      setVehicles(newVehicles);
      props.onUpdate(
        userService.updateCustomer(props.customer, {
          vehicles: newVehicles,
          cards: customerNewCardList,
        })
      );
      return { status: true, message: "Add vehicle succeed" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == HttpStatusCode.Conflict) {
          return {
            status: false,
            message: "Add vehicle failed: licenseplate already in use",
          };
        } else if (
          error.response?.status == HttpStatusCode.UnprocessableEntity
        ) {
          return {
            status: false,
            message: "Add vehicle failed: </br> Run out of cards",
          };
        }
      }
      return {
        status: false,
        message: "Add vehicle failed",
      };
    }
  };

  const handleEditVehicle = async (data: {
    licensePlate: string;
    cardId: string;
  }): Promise<ActionResult> => {
    try {
      const updatedVehicle = await vehicleService.apis.updateVehicle(
        {
          newCardId: data.cardId,
          newLicensePlate: data.licensePlate,
        },
        selectedVehicle!.vehicleId
      );

      const newVehicles = vehicleService.updateVehicle(
        updatedVehicle,
        vehicles
      );
      setVehicles(newVehicles);
      setSelectedVehicle(updatedVehicle);

      const newCards = cardService.updateCard(
        updatedVehicle.card!,
        props.customer.cards
      );

      props.onUpdate(
        //update user table
        userService.updateCustomer(props.customer, {
          vehicles: newVehicles,
          cards: newCards,
        })
      );
      return { status: true, message: "Update vehicle succeed" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == HttpStatusCode.Conflict) {
          return {
            status: false,
            message: "Update vehicle failed: licenseplate already in use",
          };
        }
      }
      return {
        status: false,
        message: "Add vehicle failed",
      };
    }
  };

  const handleDeleteVehicle = async (): Promise<ActionResult> => {
    try {
      await vehicleService.apis.deleteVehicle(selectedVehicle!.vehicleId);

      const newVehicles = vehicleService.deleteVehicle(
        selectedVehicle!.vehicleId,
        vehicles
      );
      setVehicles(newVehicles);
      setSelectedVehicle(undefined);
      props.onUpdate(
        userService.updateCustomer(props.customer, { vehicles: newVehicles })
      );
      return { status: true, message: "Delete vehicle succeed" };
    } catch (error) {
      return {
        status: false,
        message: "Delete vehicle failed",
      };
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="focus-visible_outline-none max-w-[50rem]">
        <DialogHeader className="min-h-10 mb-2">
          <DialogTitle className="text-[1.5rem] font-light font-sans">
            <span className="font-bold text-3xl">{`${props.customer.username}'s `}</span>
            Vehicles
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="relavtive h-[50vh]">
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
              {vehicles.map((vehicle, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "cursor-pointer",
                    selectedVehicle?.vehicleId === vehicle.vehicleId &&
                      "bg-slate-200"
                  )}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <TableCell className="text-center text-base">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {vehicleService.formatLicensePlate(vehicle.licensePlate)}
                  </TableCell>
                  <TableCell className="text-center text-base 2xl_text-nowrap">
                    {formatDateTime(`${vehicle.createdAt}`)}
                  </TableCell>
                  <TableCell className="text-center text-base">
                    {vehicle.card?.name}
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
        <div className="flex justify-end gap-2 mt-5">
          <VehicleActionDialog
            vehicle={selectedVehicle}
            cards={props.cards}
            type="Add"
            onSave={handleAddVehicle}
          >
            <Button variant="positive">Add</Button>
          </VehicleActionDialog>
          {selectedVehicle && (
            <>
              <VehicleActionDialog
                vehicle={selectedVehicle}
                cards={props.cards}
                type="Edit"
                onSave={handleEditVehicle}
              >
                <Button variant="neutral">Edit</Button>
              </VehicleActionDialog>
              <VehicleDeleteAlertDialog onDeleteVehicle={handleDeleteVehicle}>
                <Button variant="negative">Delete</Button>
              </VehicleDeleteAlertDialog>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewVehiclesDialog;
