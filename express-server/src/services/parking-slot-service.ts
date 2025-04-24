import prisma from "@/common/prisma-client";
import {ParkingSlotsInitialization} from "@/common/schemas";
import {ParkingSlot, SlotState} from "@prisma/client";

interface SlotDictionary {
    [key: string]: SlotState;
}

const slots: SlotDictionary = {
    [`1`]: SlotState.AVAILABLE,
    [`2`]: SlotState.AVAILABLE,
    [`3`]: SlotState.AVAILABLE,
    [`4`]: SlotState.AVAILABLE,
    [`5`]: SlotState.AVAILABLE,
    [`6`]: SlotState.AVAILABLE,
};

const getSlotsStatus = async (): Promise<ParkingSlot[]> => {
    const slotsStatus = await prisma.parkingSlot.findMany();
    slotsStatus.forEach((slot) => {
        slots[`${slot.slotId}`] = slot.state;
    });

    return slotsStatus;
};

const createSlots = async (
    validPayload: ParkingSlotsInitialization
): Promise<void> => {
    await prisma.parkingSlot.createMany({
        data: getInsertSlotsObject(validPayload.numberOfSlot),
    });
};

const updateSlotsStatus = async (
    validPayload: ParkingSlot[]
): Promise<void> => {
    const query = `
        UPDATE "ParkingSlot"
        SET "state" = CASE
            ${validPayload.map((update) => `WHEN "slotId" = ${update.slotId} THEN '${update.state}'`).join("\n")}
            ELSE "state"
        END
        WHERE "slotId" IN (${getIds(validPayload).join(", ")});
        `;

    await prisma.$executeRawUnsafe(query);
};

const convertStringToSLotState = (input: string): ParkingSlot[] => {
    return input.split(",").map((e, index) => {
        return {
            state: e == `1` ? SlotState.UNAVAILABLE : SlotState.AVAILABLE,
            slotId: index + 1,
        };
    });
};

const getUpdateSlot = (parkingSlots: ParkingSlot[]): ParkingSlot[] => {
    const updateSlot: ParkingSlot[] = [];

    parkingSlots.forEach((slot) => {
        if (slots[slot.slotId] !== slot.state) {
            updateSlot.push(slot);
            slots[slot.slotId] = slot.state;
        }
    });
    return updateSlot;
};

const isValidSlotStateStringFormat = (input: string) => {
    const regex = /^(0|1)(,(0|1)){5}$/;
    return regex.test(input);
};

const getIds = (data: {slotId: number}[]) => {
    return data.map((item) => item.slotId);
};

const getInsertSlotsObject = (numberOfSlots: number) => {
    return Array.from({length: numberOfSlots}, (_, i) => ({
        slotId: i + 1,
    }));
};

export default {
    getSlotsStatus,
    updateSlotsStatus,
    createSlots,
    convertStringToSLotState,
    isValidSlotStateStringFormat,
    getUpdateSlot,
};
