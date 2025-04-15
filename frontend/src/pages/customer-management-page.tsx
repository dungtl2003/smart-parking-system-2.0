import { Card, Customer } from "@/types/model";
import { FC, useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { cardService, userService } from "@/services";
import {
  CustomerTable,
  CustomerToolBar,
} from "@/components/customer-management";
import axios, { HttpStatusCode } from "axios";
import { ActionResult } from "@/types/component";
import {
  CustomerAdditionFormProps,
  CustomerEditionFormProps,
} from "@/utils/schema";

const CustomerManagement: FC = () => {
  const initData = useRouteLoaderData("customer-management") as Customer[];
  const [customers, setCustomers] = useState<Customer[]>(initData);
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const getCards = async () => {
      const availableCards = await cardService.apis.getCards(true);
      setCards(availableCards);
    };

    getCards();
  }, [customers]);

  const handleDeleteCustomer = async (): Promise<ActionResult> => {
    try {
      await userService.apis.customer.deleteCustomer(selectedCustomer!.userId);

      setCustomers(
        userService.deleteUser(selectedCustomer!, customers) as Customer[]
      );
      setSelectedCustomer(undefined);
      return { status: true, message: "Delete customer succeed" };
    } catch (error) {
      return {
        status: false,
        message: "Delete customer failed",
      };
    }
  };

  const handleUpdateCustomer = async (
    data: CustomerEditionFormProps
  ): Promise<ActionResult> => {
    try {
      const updatedCustomer = await userService.apis.customer.updateCustomer(
        selectedCustomer!.userId,
        data
      );

      setCustomers(
        userService.updateUser(updatedCustomer, customers) as Customer[]
      );
      setSelectedCustomer(updatedCustomer);
      return { status: true, message: "Update customer succeed" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == HttpStatusCode.Conflict) {
          return {
            status: false,
            message: "Update customer failed: <br/>email already in use",
          };
        }
      }
      return {
        status: false,
        message: "Update customer failed",
      };
    }
  };

  const handleAddCustomer = async (
    data: CustomerAdditionFormProps
  ): Promise<ActionResult> => {
    try {
      const newCustomer = await userService.apis.customer.createCustomer(data);

      setSelectedCustomer(newCustomer);
      setCustomers(userService.addUser(newCustomer, customers) as Customer[]);
      return { status: true, message: "Create customer succeed" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == HttpStatusCode.Conflict) {
          return {
            status: false,
            message: "Add customer failed: <br/>email already in use",
          };
        }
      }
      return {
        status: false,
        message: "Add customer failed",
      };
    }
  };

  return (
    <div className="my-8">
      <div className="flex gap-4 mx-auto w-xl">
        <CustomerTable
          customers={customers}
          defaultSelectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          className="flex-1"
        />

        <CustomerToolBar
          cards={cards}
          selectedCustomer={selectedCustomer}
          onUpdateCustomerAttribute={(customer) =>
            setCustomers(
              userService.updateUser(customer, customers) as Customer[]
            )
          }
          handleAddCustomer={handleAddCustomer}
          handleUpdateCustomer={handleUpdateCustomer}
          handleDeleteCustomer={handleDeleteCustomer}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;
