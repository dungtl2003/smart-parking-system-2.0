import parkingSlotService from "@/services/parking-slot";
import { ParkingSlot } from "@/types/model";
import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";
import { SlotStatus } from "@/types/enum";
import useSocket from "@/hooks/use-socket";
import { FC, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ParkingStatesPage: FC = () => {
  const initData = useRouteLoaderData("parking-status") as ParkingSlot[];
  const constantW = useRef<number>(0);
  const [slotList, setSlotList] = useState<ParkingSlot[]>(initData);
  const parkingSpaceRef = useRef<HTMLDivElement>(null);
  const firstLineRef = useRef<HTMLDivElement>(null);
  const secondLineRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const currentStateNumber = useRef<number>(0);

  useEffect(() => {
    if (parkingSpaceRef.current) {
      constantW.current = parkingSpaceRef.current.offsetWidth;
      if (firstLineRef.current)
        firstLineRef.current.style.height = `${parkingSpaceRef.current.offsetWidth * 0.1}px`;
      if (secondLineRef.current)
        secondLineRef.current.style.height = `${parkingSpaceRef.current.offsetWidth * 0.1}px`;
    }
  }, []);

  useEffect(() => {
    const setup = async () => {
      socket?.emit(`user:join`);
    };

    const listenToStateChange = (
      payload: { parkingStates: ParkingSlot[] },
      offSet: number
    ) => {
      currentStateNumber.current = offSet;
      const sortedUpdateSlot = parkingSlotService.sortSlotStates(
        payload.parkingStates
      );
      setSlotList((prevValue) =>
        parkingSlotService.updateSlotStates(prevValue, sortedUpdateSlot)
      );
    };

    socket?.on("connect", () => {
      setup();
      socket.emit("reconnect:sync", currentStateNumber.current);
    });
    socket?.on("parking-slot:update", listenToStateChange);
    setup();

    return () => {
      socket?.off(`parking-slot:update`);
      socket?.off(`connect`);
      socket?.emit(`user:leave`);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full h-full flex items-center justify-center gap-10 mt-2 pb-20">
        <div
          ref={parkingSpaceRef}
          className="flex-1 flex flex-col justify-center items-center relative h-full"
        >
          <div className="w-full h-[26rem] flex">
            {slotList.map((slot, slotNumber) => {
              return (
                <span
                  key={slotNumber}
                  className={cn(
                    "w-1/6 h-full border-x-2 font-sans text-6xl text-opacity-50 border-[rgb(24,20,20)] flex justify-center items-center",
                    slot.state === SlotStatus.UNAVAILABLE
                      ? "bg-red-500 text-black"
                      : "bg-green-500 text-white"
                  )}
                  id={`slot-${slotNumber + 1}`}
                >
                  {`${slotNumber + 1}`}
                </span>
              );
            })}
          </div>

          <div className="h-full w-full flex flex-col">
            <div
              className={`w-full h-1/6 border-b-4 border-dashed border-yellow-300`}
              ref={firstLineRef}
            ></div>
            <div className={`w-full h-2/6`}></div>
            <div className={`w-full h-2/6`}></div>
            <div
              className={`w-full h-1/6 border-t-4 border-dashed border-yellow-300`}
              ref={secondLineRef}
            ></div>
          </div>
        </div>

        <div className="h-full flex flex-col justify-center items-center relative">
          <div className="h-3/5"></div>
          <div className="relative w-[200px] h-2/5 border-y-blue-900 border-y-2 border-solid bg-[rgb(43,43,55)] text-white font-extrabold flex justify-center items-center text-lg">
            <span className="absolute left-1 top-1 opacity-50 text-base">
              Entrance
            </span>
          </div>
          <div className="relative w-[200px] h-2/5 border-y-blue-900 border-y-2 border-solid bg-[rgb(43,43,55)] text-white font-extrabold flex justify-center items-center text-lg">
            <span className="absolute left-1 top-1 opacity-50 text-base">
              Exit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingStatesPage;
