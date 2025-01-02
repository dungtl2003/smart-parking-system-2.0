import { FC, HTMLAttributes } from "react";
import { Card as CardContainer, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StaffFormProps } from "@/utils/schema";
import StaffDeleteAlertDialog from "./staff-delete-alert-dialog";
import { ActionResult } from "@/types/component";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Staff } from "@/types/model";
import StaffAdditionDialog from "./staff-addition-dialog";

interface UserToolsProps extends HTMLAttributes<HTMLDivElement> {
  selectedStaff: Staff | undefined;
  handleDeleteStaff: () => Promise<ActionResult>;
  handleAddStaff: (data: StaffFormProps) => Promise<ActionResult>;
}

const StaffToolBar: FC<UserToolsProps> = ({ ...props }) => {
  return (
    <CardContainer className={cn("rounded-xl shadow-lg", props.className)}>
      <CardContent className="p-4 space-y-4 flex flex-col">
        {/** add button */}
        <StaffAdditionDialog onSave={props.handleAddStaff}>
          <Button variant="positive" className="text-xl">
            <Plus />
          </Button>
        </StaffAdditionDialog>

        {props.selectedStaff ? (
          <>
            <StaffDeleteAlertDialog onDeleteStaff={props.handleDeleteStaff}>
              <Button variant="negative">
                <Trash2 />
              </Button>
            </StaffDeleteAlertDialog>
          </>
        ) : (
          <>
            <Trash2 className="mx-4 !mt-6" />
          </>
        )}
      </CardContent>
    </CardContainer>
  );
};

export default StaffToolBar;
