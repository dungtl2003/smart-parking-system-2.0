import {ResponseMessage} from "@/common/constants";
import {UserInToken} from "@/common/types";
import cardService from "@/services/card-service";
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

    let cardIds: string[] | undefined;
    if (user.role == UserRole.CUSTOMER) {
        cardIds = await cardService.getCardIds({
            userId: user.userId,
        });
    }

    const checkinLogs = await checkinLogService.getLogs({cardIds: cardIds});

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: checkinLogs,
    });
};

export default {
    getLogs,
};
