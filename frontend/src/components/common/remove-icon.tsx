import { LucideProps, X } from "lucide-react";
import { FC } from "react";

const RemoveIcon: FC<LucideProps> = ({ ...props }) => {
  return (
    <X
      {...props}
      className="absolute rounded-full -right-3 -top-3 bg-gray-800 text-white w-8 h-8 p-1 text-xl cursor-pointer"
    />
  );
};

export default RemoveIcon;
