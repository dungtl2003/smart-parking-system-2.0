import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { HttpStatusCode } from "axios";
import { LoadingSpinner } from "@/components/effect";
import { LoginFormProps, loginSchema } from "@/utils/schema";
import { FC, useState } from "react";
import { useAuth } from "@/hooks";
import { Eye, EyeOff } from "lucide-react";

const Login: FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormProps>({
    resolver: zodResolver(loginSchema),
  });
  const [passwordVisibility, setPasswordvisibility] = useState(false);
  const { login } = useAuth();

  const handleLoginFormSubmission: SubmitHandler<LoginFormProps> = async (
    data
  ) => {
    try {
      await login(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == HttpStatusCode.Conflict) {
          setError("root", {
            message: "You haven't logout yet",
          });
        } else if (error.response?.status == HttpStatusCode.NotFound) {
          setError("root", {
            message: "Account not exist",
          });
        } else if (error.response?.status == HttpStatusCode.Unauthorized) {
          setError("password", {
            message: "Incorrect password",
          });
        } else {
          setError("root", {
            message: "Cannot login now",
          });
        }
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleLoginFormSubmission)}
      className="w-full h-full flex justify-around"
    >
      <Card className="min-w-[30rem] max my-auto shadow-slate-400">
        <CardHeader className="mb-5">
          <CardTitle className="text-4xl font-sans mb-2 h-full">
            Login
          </CardTitle>
          <CardDescription>
            Fill in your staff's account to login
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          <div className="grid gap-2 ">
            <Label htmlFor="email" className="font-semibold text-lg">
              Email
              <span className="text-red-600 ">*</span>
            </Label>
            <Input
              id="email"
              {...register("email")}
              placeholder="eg: abc@gmail.com"
              defaultValue="huy12@gmail.com"
              autoComplete="email"
              className="text-base placeholder_text-base placeholder_italic"
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="password" className="font-semibold text-lg">
              Password
              <span className="text-red-600 ">*</span>
            </Label>
            <Input
              id="password"
              {...register("password")}
              type={!passwordVisibility ? "password" : "text"}
              defaultValue="123123a@"
              autoComplete="new-password"
              className="text-lg pr-16"
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
        </CardContent>
        <CardFooter className="flex flex-col justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="neutral"
            className="w-full text-lg"
          >
            {!isSubmitting ? (
              "Login"
            ) : (
              <LoadingSpinner size={26} className="text-white" />
            )}
          </Button>
          {(errors.root || errors.email || errors.password) && (
            <div className="text-red-600 mt-4">
              {(errors.root || errors.email || errors.password)!.message}
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};

export default Login;
