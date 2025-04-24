import { HTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/utils/constants";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardFormProps, cardSchema } from "@/utils/schema";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/effect";
import { Button } from "@/components/ui/button";
import { Card } from "@/types/model";
import { ActionResult } from "@/types/component";
import { toast } from "sonner";

interface CardActionDialogProps extends HTMLAttributes<HTMLDivElement> {
  card?: Card;
  type: `Edit` | `Add`;
  onSave: (data: CardFormProps) => Promise<ActionResult>;
}

const CardActionDialog: React.FC<CardActionDialogProps> = ({
  className,
  ...props
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CardFormProps>({
    resolver: zodResolver(cardSchema),
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (props.card) {
      setValue("name", props.card.name);
      setValue("cardCode", props.card.cardCode);
    }
  }, [props.card, setValue]);

  const handleFormSubmission: SubmitHandler<CardFormProps> = async (data) => {
    const result = await props.onSave(data);
    if (result.status) {
      toast.success(result.message);
      props.type == `Add` && reset();
      setIsOpen(false);
    } else toast.error(result.message);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit(handleFormSubmission)();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="min-w-[30rem]">
        <DialogHeader className="min-h-10">
          <DialogTitle className="text-[1.5rem]">{props.type} Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmission)}>
          <div className="flex flex-col gap-4">
            <div className="flex">
              <Label htmlFor="cardId" className="text-lg my-auto w-[18rem]">
                Card Id
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="cardId"
                {...register("cardCode")}
                type="text"
                className="h-full text-lg focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex">
              <Label
                htmlFor="custom-number"
                className="text-lg my-auto w-[18rem]"
              >
                Custom Number
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="custom-number"
                {...register("name")}
                type="text"
                className="h-full text-lg focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex justify-end">
              {(errors.root || errors.cardCode || errors.name) && (
                <div className="text-red-600 my-auto ml-auto mr-6 text-right">
                  {(errors.root || errors.cardCode || errors.name)!.message}
                </div>
              )}
              <Button
                disabled={isSubmitting}
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
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardActionDialog;
