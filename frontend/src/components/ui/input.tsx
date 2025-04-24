import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file_border-0 file_bg-transparent file_text-sm file_font-medium placeholder_text-muted-foreground focus-visible_outline-none focus-visible_ring-2 focus-visible_ring-ring focus-visible_ring-offset-2 disabled_cursor-not-allowed disabled_opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
