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
import { StaffFormProps, staffSchema } from "@/utils/schema";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/effect";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ActionResult } from "@/types/component";
import { Eye, EyeOff } from "lucide-react";

interface StaffAdditionDialogProps extends HTMLAttributes<HTMLDivElement> {
  onSave: (data: StaffFormProps) => Promise<ActionResult>;
}

const StaffAdditionDialog: React.FC<StaffAdditionDialogProps> = ({
  className,
  ...props
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormProps>({
    resolver: zodResolver(staffSchema),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [passwordVisibility, setPasswordvisibility] = useState(false);
  const [retypePasswordVisibility, setRetypePasswordvisibility] =
    useState(false);

  const handleFormSubmission: SubmitHandler<StaffFormProps> = async (data) => {
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
          <DialogTitle className="text-[1.5rem]">Add Staff Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmission)}>
          <div className="flex flex-col gap-4">
            <div className="flex">
              <Label htmlFor="name" className="text-lg my-auto w-[20rem]">
                Staff name
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
              />
            </div>
            <div className="flex relative">
              <Label htmlFor="password" className="text-lg my-auto w-[20rem]">
                Password
                <span className="text-red-600 ">*</span>
              </Label>
              <Input
                id="password"
                {...register("password")}
                type={!passwordVisibility ? "password" : "text"}
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
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
                {...register("retypepassword")}
                type={!retypePasswordVisibility ? "password" : "text"}
                className="h-full text-lg placeholder_italic placeholder_text-base focus-visible_ring-0 border-2 border-gray-300"
                onKeyDown={handleKeyDown}
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

export default StaffAdditionDialog;
