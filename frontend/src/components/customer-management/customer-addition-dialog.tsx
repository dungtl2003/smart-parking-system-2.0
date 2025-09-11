import { HTMLAttributes, useState } from "react";
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
import { toast } from "sonner";
import { ActionResult } from "@/types/component";
import {
  CustomerAdditionFormProps,
  customerAdditionSchema,
} from "@/utils/schema";
import { Eye, EyeOff } from "lucide-react";

interface CustomerAdditionDialogProps extends HTMLAttributes<HTMLDivElement> {
  onSave: (data: CustomerAdditionFormProps) => Promise<ActionResult>;
}

const CustomerAdditionDialog: React.FC<CustomerAdditionDialogProps> = ({
  className,
  ...props
}) => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CustomerAdditionFormProps>({
    resolver: zodResolver(customerAdditionSchema),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [passwordVisibility, setPasswordvisibility] = useState(false);
  const [retypePasswordVisibility, setRetypePasswordvisibility] =
    useState(false);

  const handleFormSubmission: SubmitHandler<CustomerAdditionFormProps> = async (
    data
  ) => {
    if (data.password != data.retypepassword) {
      setError("root", { message: `Retype password not match` });
      return;
    }

    const result = await props.onSave(data);
    if (result.status) {
      toast.success(result.message);
      reset();
      setIsOpen(false);
    } else toast.error(result.message);
  };

  const handleEnterLastInput = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit(handleFormSubmission)();
    }
  };

  const focusNextInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextInput: "username" | "password" | "retypepassword" | "email"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setFocus(nextInput);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="min-w-[30rem]">
        <DialogHeader className="min-h-10 mb-2">
          <DialogTitle className="text-[1.5rem]">Add Customer</DialogTitle>
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
                autoComplete="off"
                {...register("username")}
                type="text"
                placeholder="eg: John Smith"
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={(e) => focusNextInput(e, "email")}
              />
            </div>
            <div className="flex">
              <Label htmlFor="email" className="text-lg my-auto w-[20rem]">
                Email
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="email"
                autoComplete="off"
                {...register("email")}
                type="text"
                placeholder="eg: abc@gmail.com"
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={(e) => focusNextInput(e, "password")}
              />
            </div>
            <div className="flex relative">
              <Label htmlFor="password" className="text-lg my-auto w-[20rem]">
                Password
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="password"
                autoComplete="new-password"
                {...register("password")}
                type={!passwordVisibility ? "password" : "text"}
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={(e) => focusNextInput(e, "retypepassword")}
              />
              <button
                className="absolute right-3 bottom-[0.5rem] text-muted-foreground border-l-2 pl-3"
                onClick={(e) => {
                  e.preventDefault();
                  setPasswordvisibility(!passwordVisibility);
                }}
              >
                {passwordVisibility ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <div className="flex relative">
              <Label
                htmlFor="retypepassword"
                className="text-lg my-auto w-[20rem]"
              >
                Retype Password
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="retypepassword"
                autoComplete="new-password"
                {...register("retypepassword")}
                type={!retypePasswordVisibility ? "password" : "text"}
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={handleEnterLastInput}
              />
              <button
                className="absolute right-3 bottom-[0.5rem] text-muted-foreground border-l-2 pl-3"
                onClick={(e) => {
                  e.preventDefault();
                  setRetypePasswordvisibility(!retypePasswordVisibility);
                }}
              >
                {retypePasswordVisibility ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <div className="flex justify-end">
              {(errors.root ||
                errors.email ||
                errors.username ||
                errors.password ||
                errors.retypepassword) && (
                <div className="text-red-600 my-auto ml-auto mr-6 text-right">
                  {
                    (errors.root ||
                      errors.email ||
                      errors.username ||
                      errors.password ||
                      errors.retypepassword)!.message
                  }
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

export default CustomerAdditionDialog;
