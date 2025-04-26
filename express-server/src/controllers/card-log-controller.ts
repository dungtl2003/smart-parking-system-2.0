import {ResponseMessage} from "@/common/constants";
import {UserInToken} from "@/common/types";
import checkinLogService from "@/services/checkin-log-service";
import jwtService from "@/services/jwt-service";
import {UserRole} from "@prisma/client";
import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

const getLogs = async (req: Request, res: Response) => {
    const accessToken = req.headers["authorization"] as string;

    const user = jwtService.decodeToken(
        accessToken.replace("Bearer ", "")
    ) as UserInToken;

    const checkinLogs = await checkinLogService.getLogs({
        userId: user.role == UserRole.CUSTOMER ? user.userId : null,
    });

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: checkinLogs,
    });
};

export default {
    getLogs,
};
