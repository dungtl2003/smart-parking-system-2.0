import { axiosInstance } from "@/config";
import { ParkingSlot } from "@/types/model";

const parkingSlotEndpoint = "/parking-slots";

const parkingSlotService = {
  apis: {
    getSlotsState: async () => {
      const res = await axiosInstance.get<{ info: ParkingSlot[] }>(
        `${parkingSlotEndpoint}`
      );

      return res.data.info;
    },
  },
  sortSlotStates: (parkingSlots: ParkingSlot[]) => {
    return parkingSlots.sort((a, b) => Number(a.slotId) - Number(b.slotId));
  },
  updateSlotStates: (
    currentSlots: ParkingSlot[],
    slotsToUpdate: ParkingSlot[] //must contain at least one slot
  ): ParkingSlot[] => {
    //two list must be sorted ascending
    let updatedSlotIndex = 0;
    return currentSlots.map((slot) => {
      if (
        slotsToUpdate[updatedSlotIndex] &&
        slotsToUpdate[updatedSlotIndex].slotId === slot.slotId
      ) {
        return slotsToUpdate[updatedSlotIndex++];
      }

      return slot;
    });
  },
};

export default parkingSlotService;
