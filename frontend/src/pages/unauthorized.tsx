import { FC } from "react";

const Unauthorized: FC = () => {
  return (
    <div className="max-h-[100vh] flex justify-center flex-col">
      <img src="/stop.svg" alt="stop" className="max-h-[30rem]" />
      <p className="text-slate-500 text-[1.3rem] text-center">
        You are not allowed here
      </p>
    </div>
  );
};

export default Unauthorized;
