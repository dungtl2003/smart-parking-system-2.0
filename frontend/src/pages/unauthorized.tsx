import { buttonVariants } from "@/utils/constants";
import { FC } from "react";
import { Link } from "react-router-dom";

const Unauthorized: FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen font-sans">
      <div className="text-center w-[460px] leading-relaxed">
        <div className="h-[158px] leading-[153px]">
          <h1 className="font-sans text-[220px] text-gray-900 tracking-wider font-bold m-0 text-shadow-red">
            4<span className="text-shadow-4xx-blue">0</span>3
          </h1>
        </div>
        <p className="text-gray-400 text-lg mb-4 mt-12">
          You are not allowed here
        </p>
        <Link to={"/"} className={buttonVariants({ variant: "negative" })}>
          Home Page
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
