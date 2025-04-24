import { HTMLAttributes, useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/utils/constants";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/effect";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ActionResult } from "@/types/component";
import { Card, Vehicle } from "@/types/model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

interface VehicleActionDialogProps extends HTMLAttributes<HTMLDivElement> {
  cards: Card[];
  vehicle?: Vehicle;
  type: `Edit` | `Add`;
  onSave: (data: {
    licensePlate: string;
    cardId: string;
  }) => Promise<ActionResult>;
}

const VehicleActionDialog: React.FC<VehicleActionDialogProps> = ({
  className,
  ...props
}) => {
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(
    props.vehicle?.cardId
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (props.vehicle) {
      props.type == "Edit" && setLicensePlate(props.vehicle.licensePlate);
    }
    setSelectedCardId(props.vehicle?.cardId);
  }, [props.vehicle, props.type]);

  const handleSubmission = async () => {
    const pattern = /^\d{2}[A-Z]\d{5}$/;
    if (!pattern.test(licensePlate)) {
      setErrorMessage(`Invalid license plate`);
      return;
    }

    if (!selectedCardId) {
      setErrorMessage(`Card selection is required`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await props.onSave({ licensePlate, cardId: selectedCardId });
    setIsSubmitting(false);
    if (result.status) {
      toast.success(result.message);
      setIsOpen(false);
      setLicensePlate("");
      setSelectedCardId(undefined);
    } else toast.error(result.message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="focus-visible_outline-none min-w-fit">
        <DialogHeader className="min-h-10 mb-2">
          <DialogTitle className="text-[1.5rem]">
            {props.type} Vehicle Information
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex">
            <Label
              htmlFor="licensePlate"
              className="text-lg my-auto text-nowrap mr-8 w-32 text-end"
            >
              License Plate
              <span className="text-red-600 ">*</span>
            </Label>
            <InputOTP
              maxLength={8}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={licensePlate}
              onChange={(value) => setLicensePlate(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <span className="font-bold text-2xl mx-2"> - </span>
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex mt-8">
            <Label
              htmlFor="licensePlate"
              className="text-lg my-auto text-nowrap mr-8 w-32 text-end"
            >
              Card
              <span className="text-red-600 ">*</span>
            </Label>
            <Select
              value={selectedCardId}
              onValueChange={(value) => setSelectedCardId(value)}
            >
              <SelectTrigger value={selectedCardId} className="w-[10rem] pl-8">
                <SelectValue placeholder="Select card" />
              </SelectTrigger>
              <SelectContent>
                {props.vehicle && props.type == "Edit" && (
                  <SelectItem
                    key={props.vehicle.cardId}
                    value={props.vehicle.cardId}
                  >
                    {props.vehicle.card!.name}
                  </SelectItem>
                )}
                {props.cards.map((card) => {
                  return (
                    <SelectItem key={card.cardId} value={card.cardId}>
                      {card.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex mt-8 justify-between items-center">
            <span className="text-slate-400 text-lg text-right italic">
              Eg: 30H-166.50
            </span>
            <span>
              {errorMessage && (
                <span className="text-red-600 mr-6 text-right">
                  {errorMessage}
                </span>
              )}
              <Button
                disabled={isSubmitting}
                onClick={handleSubmission}
                className={cn(
                  "mt-auto",
                  buttonVariants({ variant: "positive" })
                )}
              >
                {!isSubmitting ? (
                  "Save"
                ) : (
                  <>
                    <LoadingSpinner size={26} className="text-white" />
                  </>
                )}
              </Button>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleActionDialog;
