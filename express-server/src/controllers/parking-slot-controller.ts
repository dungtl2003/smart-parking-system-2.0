import {ResponseMessage} from "@/common/constants";
import {ParkingSlotsInitialization} from "@/common/schemas";
import parkingSlotService from "@/services/parking-slot-service";
import socketService from "@/services/socket-service";
import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

const getParkingSlots = async (req: Request, res: Response) => {
    const slotsStatus = await parkingSlotService.getSlotsStatus();

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: slotsStatus,
    });
};

const initParkingSlots = async (req: Request, res: Response) => {
    const numberOfParkingSlots = req.body as ParkingSlotsInitialization;
    await parkingSlotService.createSlots(numberOfParkingSlots);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

const updateParkingSlots = async (req: Request, res: Response) => {
    const statesString = req.body.states as string;
    console.log(statesString, statesString.length);

    if (!parkingSlotService.isValidSlotStateStringFormat(statesString)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: `States must be in format n,n,n,n,n,n (n can only be 0 or 1)`,
        });
    }

    const newStates = parkingSlotService.convertStringToSLotState(statesString);
    parkingSlotService.updateSlotsStatus(newStates); //update db
    const updateSlot = parkingSlotService.getUpdateSlot(newStates);
    if (updateSlot.length > 0) {
        console.log(updateSlot);
        socketService.emitToParkingRoom({parkingStates: updateSlot});
    }

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

export default {
    updateParkingSlots,
    getParkingSlots,
    initParkingSlots,
};
