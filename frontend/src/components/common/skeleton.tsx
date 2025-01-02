import { HTMLAttributes } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const BaseSkeleton: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <Skeleton
      className={cn(
        "h-6 w-4/5 rounded-md mx-auto bg-slate-200 mt-4",
        className
      )}
      {...props}
    />
  );
};

interface LinesSkeletonProps extends HTMLAttributes<HTMLUListElement> {
  quantity: number;
}

const LinesSkeleton: React.FC<LinesSkeletonProps> = ({
  className,
  ...props
}) => {
  return (
    <ul className={className} {...props}>
      {Array.from({ length: props.quantity }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-6 w-4/5 rounded-md mx-auto bg-slate-200 mt-4"
        />
      ))}
    </ul>
  );
};

export { BaseSkeleton, LinesSkeleton };
