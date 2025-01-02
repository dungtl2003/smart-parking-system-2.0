import { FC, HTMLAttributes } from "react";

const RippleEffect: FC<HTMLAttributes<HTMLDivElement>> = () => {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      {/* The static circle */}
      <div className="absolute w-2 h-2 bg-red-500 rounded-full z-10 flex items-center justify-center" />

      {/* Ripple animation */}
      <div className="absolute w-4 h-4 bg-red-400 rounded-full animate-ping" />
      <div className="absolute w-5 h-5 bg-red-400 rounded-full animate-ping" />
      <div className="absolute w-6 h-6 bg-red-400 rounded-full animate-ping" />
    </div>
  );
};

export default RippleEffect;
