import {ResponseMessage} from "@/common/constants";
import {Request, Response} from "express";
import vehicleService from "@/services/vehicle-service";
import userService from "@/services/user-service";
import {StatusCodes} from "http-status-codes";
import {VehicleInsertion, VehicleUpdate} from "@/common/schemas";
import UserNotFoundError from "@/errors/user/user-not-found";

const updateVehicle = async (req: Request, res: Response) => {
    const vehicleId = req.params.id as string;
    const reqBody = req.body as VehicleUpdate;

    const vehicle = await vehicleService.updateVehicle(vehicleId, reqBody);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: vehicle,
    });
};

const insertVehicle = async (req: Request, res: Response) => {
    const reqBody = req.body as VehicleInsertion;

    const user = await userService.getUserDTO(reqBody.userId);
    if (!user) throw new UserNotFoundError(ResponseMessage.NOT_FOUND);

    const vehicle = await vehicleService.insertVehicle(reqBody, user);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: vehicle,
    });
};

const deleteVehicle = async (req: Request, res: Response) => {
    const vehicleId = req.params.id as string;

    await vehicleService.deleteVehicle(vehicleId);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

export default {
    insertVehicle,
    updateVehicle,
    deleteVehicle,
};
