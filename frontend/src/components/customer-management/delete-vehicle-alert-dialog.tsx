import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ActionResult } from "@/types/component";
import { buttonVariants } from "@/utils/constants";
import { FC, HTMLAttributes, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "../effect";

interface VehicleDeleteAlertDialogProps extends HTMLAttributes<HTMLDivElement> {
  onDeleteVehicle: () => Promise<ActionResult>;
}

const VehicleDeleteAlertDialog: FC<VehicleDeleteAlertDialogProps> = ({
  ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteAction = async () => {
    setIsSubmitting(true);
    const result = await props.onDeleteVehicle();
    setIsSubmitting(false);
    setIsOpen(false);
    if (result.status) {
      toast.success(result.message);
    } else toast.error(result.message);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wanna delete?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove the vehicle and cannot be undo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={handleDeleteAction}
            className={cn("mt-auto", buttonVariants({ variant: "negative" }))}
          >
            {!isSubmitting ? (
              "Delete"
            ) : (
              <>
                <LoadingSpinner size={26} className="text-white" />
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VehicleDeleteAlertDialog;
