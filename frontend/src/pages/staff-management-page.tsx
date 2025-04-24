import { Staff } from "@/types/model";
import { FC, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { userService } from "@/services";
import axios, { HttpStatusCode } from "axios";
import { ActionResult } from "@/types/component";
import { StaffTable, StaffToolBar } from "@/components/staff-management";
import { StaffFormProps } from "@/utils/schema";

const StaffManagement: FC = () => {
  const initData = useRouteLoaderData("staff-management") as Staff[];
  const [staffs, setStaffs] = useState<Staff[]>(initData);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();

  const handleDeleteStaff = async (): Promise<ActionResult> => {
    try {
      await userService.apis.staff.deleteStaff(selectedStaff!.userId);

      setStaffs(userService.deleteUser(selectedStaff!, staffs) as Staff[]);
      setSelectedStaff(undefined);
      return { status: true, message: "Delete staff succeed" };
    } catch (error) {
      return {
        status: false,
        message: "Delete staff failed",
      };
    }
  };

  const handleAddStaff = async (
    data: StaffFormProps
  ): Promise<ActionResult> => {
    try {
      const newStaff = await userService.apis.staff.createStaff(data);

      setStaffs(userService.addUser(newStaff, staffs) as Staff[]);
      return { status: true, message: "Create staff succeed" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == HttpStatusCode.Conflict) {
          return {
            status: false,
            message: "Add staff failed: email already in use",
          };
        }
      }
      return {
        status: false,
        message: "Add staff failed",
      };
    }
  };

  return (
    <div className="my-8">
      <div className="flex gap-4 mx-auto w-xl">
        <StaffTable
          staffs={staffs}
          onSelectStaff={setSelectedStaff}
          className="flex-1"
        />

        <StaffToolBar
          selectedStaff={selectedStaff}
          handleAddStaff={handleAddStaff}
          handleDeleteStaff={handleDeleteStaff}
        />
      </div>
    </div>
  );
};

export default StaffManagement;
