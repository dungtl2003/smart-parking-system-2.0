import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { ButtonHTMLAttributes, FC, useEffect, useState } from "react";

const ScrollToTopButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
}) => {
  const [showButton, setShowButton] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > window.innerHeight) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      className={cn(
        "hidden fixed w-14 h-14 rounded-full bg-slate-50 shadow-general text-slate-500",
        showButton && "flex justify-center items-center",
        className
      )}
      onClick={() => window.scrollTo(0, 0)}
    >
      <ChevronUp size={40} />
    </button>
  );
};

export default ScrollToTopButton;
