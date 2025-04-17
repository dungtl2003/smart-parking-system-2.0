import {ResponseMessage} from "@/common/constants";
import {CardInsertion, CardUpdate} from "@/common/schemas";
import cardService from "@/services/card-service";
import {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import axios, {AxiosError} from "axios";
import config from "@/common/app-config";
import {CardScanningType} from "@prisma/client";
import checkinLogService from "@/services/checkin-log-service";
import socketService from "@/services/socket-service";
import {ScannedLog} from "@/common/types";

const getCards = async (req: Request, res: Response) => {
    const available = Number(req.query.available);
    const cards = await cardService.getCards({
        userId: available == 1 ? null : undefined,
    });

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: cards,
    });
};

const insertCard = async (req: Request, res: Response) => {
    const reqBody = req.body as CardInsertion;

    const card = await cardService.insertCard(reqBody);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: card,
    });
};

const updateCard = async (req: Request, res: Response) => {
    const cardId = req.params.id as string;
    const reqBody = req.body as CardUpdate;

    const card = await cardService.updateCard(cardId, reqBody);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: card,
    });
};

const deleteCard = async (req: Request, res: Response) => {
    const cardId = req.params.id as string;

    await cardService.deleteCard(cardId);

    res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
    });
};

const validateCard = async (req: Request, res: Response) => {
    let cardId = req.query.card_id as string;
    let gatePos = req.query.gate_pos as string;
    if (cardId || gatePos) {
        cardId = cardId.trim();
        gatePos = gatePos.trim();
        console.debug("incoming cardID and Pos: " + cardId + " " + gatePos);
    }
    const vehicle = await cardService.getCardLinkedToVehicle(cardId);
    console.debug("Get vehicle from DB: ", vehicle);

    try {
        const scanResult = await axios.post<{status: "valid" | "invalid"}>(
            config.CAMERA_SERVER_API + `?timeout=5000`,
            {
                plate_number: vehicle.licensePlate,
                gate_pos: gatePos,
            },
            {
                timeout: 30000,
            }
        );
        console.debug(`python server response: ${scanResult}`);

        //test
        // const scanResult = {
        //     data: {
        //         status: "valid",
        //     },
        // };

        if (scanResult.data.status == "valid") {
            const currentTime: Date = new Date();
            const cardScanningType =
                gatePos == `R`
                    ? CardScanningType.CHECKIN
                    : CardScanningType.CHECKOUT;

            //update time in card table
            cardService.updateCardInOutTime(
                vehicle.cardId,
                cardScanningType,
                currentTime
            );

            const newLog: ScannedLog = {
                cardId: vehicle.cardId,
                licensePlate: vehicle.licensePlate,
                type: cardScanningType,
                createdAt: currentTime,
            };
            //insert new log to checkinLog table
            checkinLogService.insertLog(newLog);
            //emit new log to frontend
            socketService.emitToCardListPageRoom({
                log: newLog,
            });
        } else {
            throw new AxiosError();
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
                message: "Failed to validate car license plate",
            });
        } else {
            throw new Error("Unexpected error: " + error);
        }
    }

    return res.status(StatusCodes.OK).json({
        message: ResponseMessage.SUCCESS,
        info: vehicle.username,
    });
};

export default {
    getCards,
    insertCard,
    updateCard,
    deleteCard,
    validateCard,
};
