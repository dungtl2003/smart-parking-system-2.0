import parkingSlotService from "@/services/parking-slot";
import { ParkingSlot } from "@/types/model";
import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";
import { SlotStatus } from "@/types/enum";
import useSocket from "@/hooks/use-socket";
import { FC, useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks";
import { userService } from "@/services";

const ParkingStatesPage: FC = () => {
  const initData = useRouteLoaderData("parking-status") as ParkingSlot[];
  const [w, setW] = useState<number>();
  const [h, setH] = useState<number>();
  const constantW = useRef<number>(0);
  const [slotList, setSlotList] = useState<ParkingSlot[]>(initData);
  const parkingSpaceRef = useRef<HTMLDivElement>(null);
  const firstLineRef = useRef<HTMLDivElement>(null);
  const secondLineRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const currentStateNumber = useRef<number>(0);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (parkingSpaceRef.current) {
      setW(parkingSpaceRef.current.offsetWidth);
      setH(parkingSpaceRef.current.offsetHeight);
      constantW.current = parkingSpaceRef.current.offsetWidth;
      if (firstLineRef.current)
        firstLineRef.current.style.height = `${parkingSpaceRef.current.offsetWidth * 0.1}px`;
      if (secondLineRef.current)
        secondLineRef.current.style.height = `${parkingSpaceRef.current.offsetWidth * 0.1}px`;
    }
  }, []);

  useEffect(() => {
    if (w) {
      slotList.forEach((slot) => {
        if (slot.state === SlotStatus.UNAVAILABLE) {
          generateNewCar(slot.slotId);
          const carElement = document.getElementById(`car${slot.slotId}`);

          if (carElement) {
            const slotWidth = w / 6;
            carElement.style.right = `${-w + (7 - slot.slotId) * slotWidth - slotWidth / 2 - carElement.offsetWidth / 2}px`;
            carElement.classList.add(`init-position`);
          }
        }
      });
    }
  }, [w]);

  useEffect(() => {
    if (parkingSpaceRef.current && h && w) {
      // Tạo animation style
      const anim = document.createElement("style");
      const rule1 = document.createTextNode(`
        @-webkit-keyframes car-park {
          from { transform: rotate(270deg) translate(-15px, 0px); }
          70% { transform: rotate(270deg) translate(-15px, -${w}px); }
          80% { transform: rotate(270deg) translate(-15px, -${w}px) rotate(35deg); }
          90% { transform: rotate(270deg) translate(-15px, -${w}px) rotate(45deg); }
          to { transform: rotate(270deg) translate(-15px, -${w}px) rotate(90deg) translate(0px, -${h * 0.32}px); }
        }
      `);
      anim.appendChild(rule1);

      const rule2 = document.createTextNode(`
        @-webkit-keyframes car-exit-top {
          from { transform: rotate(270deg) translate(-15px, -${w}px) rotate(90deg) translate(0px, -${h * 0.25}px); }
          80% { transform: rotate(270deg) translate(-15px, -${w}px) rotate(90deg) translate(0px, -${h * 0.25}px) translate(0px, ${h * 0.6}px); }
          90% { transform: rotate(270deg) translate(-15px, -${w}px) rotate(90deg) translate(0px, -${h * 0.25}px) translate(0px, ${h * 0.6}px) rotate(90deg); }
          to { transform: rotate(270deg) translate(-15px, -${w}px) rotate(90deg) translate(0px, -${h * 0.25}px) translate(0px, ${h * 0.6}px) rotate(90deg) translate(0px, -${w * 1.5}px); }
        }
      `);
      anim.appendChild(rule2);

      const rule3 = document.createTextNode(`
        .init-position {
          transform: rotate(270deg) translate(-15px, -${w}px) rotate(90deg) translate(0px, -${h * 0.32}px);
        }
      `);
      anim.appendChild(rule3);

      parkingSpaceRef.current.appendChild(anim);
    }
  }, [w, h]);

  useEffect(() => {
    const setup = async () => {
      socket?.emit(`user:join`);
    };

    const listenToStateChange = (
      payload: { parkingStates: ParkingSlot[] },
      offSet: number
    ) => {
      currentStateNumber.current = offSet;
      payload.parkingStates.forEach((slotNewState) => {
        console.log(payload.parkingStates);
        const carElement = document.getElementById(`car${slotNewState.slotId}`);

        if (carElement) {
          if (slotNewState.state === SlotStatus.AVAILABLE) {
            handleCarExit(slotNewState.slotId);
          }
        } else {
          if (slotNewState.state === SlotStatus.UNAVAILABLE) {
            handleCarEnter(slotNewState.slotId);
          }
        }
      });

      const sortedUpdateSlot = parkingSlotService.sortSlotStates(
        payload.parkingStates
      );
      const newSlotsState = parkingSlotService.updateSlotStates(
        slotList,
        sortedUpdateSlot
      );
      setSlotList(newSlotsState);
    };

    socket?.on("connect", () => {
      setup();
      socket.emit("user:join");
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

  const handleCarExit = (slot: number) => {
    const newParklist = [...slotList];
    newParklist[slot - 1].state = SlotStatus.AVAILABLE;
    setSlotList(newParklist);

    const carElement = document.getElementById(`car${slot}`);

    if (carElement) {
      carElement.style.animation = `car-exit-top ${7 - slot}s both`;
    }

    setTimeout(
      () => {
        if (carElement) carElement.remove();
      },
      Number(`${7 - slot}000`)
    );
  };

  const generateNewCar = (slot: number) => {
    if (parkingSpaceRef.current) {
      const space = parkingSpaceRef.current;
      const img = document.createElement("img");
      img.src = "car-1.png";
      img.className = "absolute z-10 m-auto";
      img.style.width = `${constantW.current * 0.2}px`;
      img.id = `car${slot}`;

      space.appendChild(img);
    }
  };

  const handleCarEnter = (slot: number) => {
    if (!document.getElementById(`car${slot}`)) {
      const newParklist = [...slotList];
      newParklist[slot - 1].state = SlotStatus.UNAVAILABLE;
      setSlotList(newParklist);

      generateNewCar(slot);

      const carElement = document.getElementById(`car${slot}`);
      if (carElement) {
        const slotWidth = constantW.current / 6;
        carElement.style.right = `${-constantW.current + (7 - slot) * slotWidth - slotWidth / 2 - carElement.offsetWidth / 2}px`;

        carElement.style.animation = `car-park ${2}s both`;
      }
    } else {
      handleCarExit(slot);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full h-full flex items-center justify-center gap-10 mt-2 pb-20">
        {currentUser && userService.isAuthorize(currentUser) && (
          <div className="bg-[rgb(45,42,42)] w-[20rem] px-4">
            <div className="text-white mt-4 text-xl font-bold">
              Slot Management Remote
            </div>
            <div className="text-white grid grid-cols-3 gap-3 py-4">
              {parkingSlotService.sortSlotStates(slotList).map((slot) => (
                <span
                  key={slot.slotId}
                  onClick={() => handleCarEnter(slot.slotId)}
                  id={`slot${slot.slotId}`}
                  className={`py-4 text-center cursor-pointer ${slot.state == SlotStatus.UNAVAILABLE ? "bg-red-700" : "bg-green-700"}`}
                >
                  {slot.slotId}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          ref={parkingSpaceRef}
          className="flex-1 flex flex-col justify-center items-center relative h-full"
        >
          <div className="w-full h-[26rem] flex">
            {Array.from({ length: 6 }).map((_, slotNumber) => {
              return (
                <span
                  key={slotNumber}
                  className="w-1/6 h-full border-x-2 font-sans text-6xl text-opacity-50 border-[rgb(24,20,20)] bg-[rgb(31,31,40)] flex justify-center items-center text-gray-300"
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
