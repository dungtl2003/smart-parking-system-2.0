import { AxiosResponse } from "axios";
import { axiosInstance } from "@/config/axios-config";
import { Card, Customer, Staff, User, Vehicle } from "@/types/model";
import { CustomerFormProps, StaffFormProps } from "@/utils/schema";
import { Args } from "@/utils/helpers";

const userEndPoint = "/users";
const customerEndPoint = "/customers";
const staffEndPoint = "/staffs";

const userService = {
  apis: {
    getUser: async (args: Args | string): Promise<Customer | null> => {
      const userId: string = typeof args === "string" ? args : args.params.id!;

      try {
        const res = await axiosInstance.get<{ info: Customer }>(
          `${userEndPoint}/${userId}`
        );
        return res.data.info;
      } catch (error) {
        console.error("Unexpected error:", error);
        return null;
      }
    },
    customer: {
      getCustomers: async (): Promise<Customer[]> => {
        const res = await axiosInstance.get<{
          info: Customer[];
        }>(customerEndPoint);
        return res.data.info;
      },
      createCustomer: async (data: CustomerFormProps): Promise<Customer> => {
        const response = await axiosInstance.post<{ info: Customer }>(
          `${customerEndPoint}/signup`,
          {
            username: data.username.trim(),
            email: data.email.trim(),
          }
        );

        return response.data.info;
      },
      updateCustomer: async (
        customerId: string,
        data: CustomerFormProps
      ): Promise<Customer> => {
        const res = await axiosInstance.put<{ info: Customer }>(
          `${customerEndPoint}/${customerId}`,
          {
            username: data.username.trim(),
            email: data.email.trim(),
          }
        );
        return res.data.info;
      },
      deleteCustomer: async (customerId: string): Promise<AxiosResponse> => {
        const res = await axiosInstance.delete(
          `${customerEndPoint}/${customerId}`
        );
        return res;
      },
    },
    staff: {
      getStaffs: async (): Promise<Staff[]> => {
        const res = await axiosInstance.get<{
          info: Staff[];
        }>(staffEndPoint);
        return res.data.info;
      },
      createStaff: async (data: StaffFormProps): Promise<Staff> => {
        const response = await axiosInstance.post<{ info: Staff }>(
          `${staffEndPoint}/signup`,
          {
            username: data.username.trim(),
            email: data.email.trim(),
            password: data.password.trim(),
          }
        );

        return response.data.info;
      },
      deleteStaff: async (staffId: string): Promise<AxiosResponse> => {
        const res = await axiosInstance.delete(`${staffEndPoint}/${staffId}`);
        return res;
      },
      updateStaffPassword: async (
        prePassword: string,
        newPassword: string
      ): Promise<AxiosResponse> => {
        const res = await axiosInstance.patch(`${staffEndPoint}/password`, {
          oldPassword: prePassword.trim(),
          newPassword: newPassword.trim(),
        });
        return res;
      },
    },
  },
  addUser: (newUser: User, prevUsers: User[]) => {
    return [newUser, ...prevUsers];
  },
  updateUser: (selectedUser: User, prevUsers: User[]) => {
    return [
      selectedUser,
      ...prevUsers.filter((e) => e.userId !== selectedUser.userId),
    ];
  },
  deleteUser: (selectedUser: User, prevUsers: User[]) => {
    return [...prevUsers.filter((e) => e.userId !== selectedUser.userId)];
  },
  updateCustomer: (
    customerToUpdate: Customer,
    params: { vehicles?: Vehicle[]; cards?: Card[] }
  ): Customer => {
    return {
      ...customerToUpdate,
      cards: params.cards || customerToUpdate.cards,
      vehicles: params.vehicles || customerToUpdate.vehicles,
    };
  },
  isActive: (customer: Customer) => {
    return customer.vehicles && customer.vehicles.length > 0;
  },
};

export default userService;
