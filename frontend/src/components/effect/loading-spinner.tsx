import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 40, className }) => {
  const spinnerSize = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${size / 8}px`,
  };

  return (
    <div
      className={cn(
        "inline-block border-t-4 border-dashed border-current rounded-full animate-spin",
        className
      )}
      style={spinnerSize}
    />
  );
};

export default LoadingSpinner;
