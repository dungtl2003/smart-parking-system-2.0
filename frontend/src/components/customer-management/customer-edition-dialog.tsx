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
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/effect";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/model";
import { toast } from "sonner";
import { ActionResult } from "@/types/component";
import {
  CustomerEditionFormProps,
  customerEditionSchema,
} from "@/utils/schema";

interface CustomerEditionDialogProps extends HTMLAttributes<HTMLDivElement> {
  customer?: Customer;
  onSave: (data: CustomerEditionFormProps) => Promise<ActionResult>;
}

const CustomerEditionDialog: React.FC<CustomerEditionDialogProps> = ({
  className,
  ...props
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerEditionFormProps>({
    resolver: zodResolver(customerEditionSchema),
    defaultValues: props.customer && {
      username: props.customer.username,
    },
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (props.customer) {
      setValue("username", props.customer.username);
      setValue("email", props.customer.email);
    }
  }, [props.customer, setValue]);

  const handleFormSubmission: SubmitHandler<CustomerEditionFormProps> = async (
    data
  ) => {
    const result = await props.onSave(data);
    if (result.status) {
      toast.success(result.message);
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
        <DialogHeader className="min-h-10 mb-2">
          <DialogTitle className="text-[1.5rem]">Edi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmission)}>
          <div className="flex flex-col gap-4">
            <div className="flex">
              <Label htmlFor="name" className="text-lg my-auto w-[20rem]">
                Customer name
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="name"
                {...register("username")}
                type="text"
                placeholder="eg: John Smith"
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
              />
            </div>
            <div className="flex">
              <Label htmlFor="email" className="text-lg my-auto w-[20rem]">
                Email
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="email"
                {...register("email")}
                type="text"
                placeholder="eg: abc@gmail.com"
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex justify-end">
              {(errors.root || errors.email || errors.username) && (
                <div className="text-red-600 my-auto ml-auto mr-6 text-right">
                  {(errors.root || errors.email || errors.username)!.message}
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

export default CustomerEditionDialog;
