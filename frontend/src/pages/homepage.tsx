import { useCustomNavigate } from "@/hooks";
import { ArrowUpRight } from "lucide-react";
import { FC, useEffect, useState } from "react";
const Homepage: FC = () => {
  const text = "Smart Parking System";
  const [displayedText, setDisplayedText] = useState<string>("");
  const { navigate } = useCustomNavigate();
  const typingSpeed = 100;

  useEffect(() => {
    let index = 0;

    let currentText = "";

    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index]; // Cập nhật biến cục bộ
        setDisplayedText(currentText); // Cập nhật React state
        index++;
      } else {
        clearInterval(interval); // Dừng interval khi hoàn tất
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center bg-transparent">
        <h1 className="text-9xl text-white text-shadow-h1 text-center font-bold font-sans mb-32 mt-20">
          {displayedText}
        </h1>
        <button
          onClick={() =>
            navigate("/parkingStatus", { unstable_viewTransition: true })
          }
          className="text-xl transform
           animate-fadeInScale bg-white text-black px-4 py-2 rounded-3xl font-sans flex hover_bg-destructive hover_text-white hover_border-none transition-all duration-300"
        >
          View Parking Area
          <ArrowUpRight className="ml-2 self-center" />
        </button>
      </div>
    </div>
  );
};

export default Homepage;
