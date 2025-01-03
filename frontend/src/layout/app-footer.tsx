import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const githubUrl = "https://github.com/dungtl2003/smart-parking-system-2.0";

interface AppFooterProps extends HTMLAttributes<HTMLElement> {}

const AppFooter: React.FC<AppFooterProps> = ({ className }) => {
  return (
    <footer
      id="footer"
      className={cn(
        "w-full flex justify-evenly shadow-inner mt-auto pt-10 bg-zinc-800 text-white",
        className
      )}
    >
      <div className="w-3/4 my-5">
        <div className="flex flex-col items-center space-y-2">
          <span className="font-extrabold text-xl">ABOUT US</span>
          <span>© 2024 Smart Parking System Business</span>
          <span>
            Corporate Office: 141 Chien Thang Street, Tan Trieu, Thanh Tri, Ha
            Noi
          </span>
          <span>24 Hour Service: 0773 341 ***</span>
          <span className="underline font-extrabold">sps_fw@gmail.com</span>
        </div>

        <div className="border-t-slate-300 border-t-2 mt-10 pt-5 flex justify-between items-center">
          <span className="flex items-center space-x-2">
            <span className="font-semibold text-base">Get In Touch</span>
            <a href={githubUrl} target="_blank">
              <img src="/github.png" alt="github" className="w-10 ml-2" />
            </a>
          </span>

          <img src="/bct.png" className="h-16" />
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
