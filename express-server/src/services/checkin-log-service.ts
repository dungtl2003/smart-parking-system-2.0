import prisma from "@/common/prisma-client";
import {CardScanningType, CheckinLog} from "@prisma/client";

const insertLog = async (validPayload: {
    cardId: string;
    licensePlate: string;
    type: CardScanningType;
    createdAt: Date;
}): Promise<void> => {
    await prisma.checkinLog.create({
        data: validPayload,
    });
};

const getLogs = async (params: {cardIds?: string[]}): Promise<CheckinLog[]> => {
    const result = await prisma.checkinLog.findMany({
        where: {
            cardId: {
                in: params.cardIds,
            },
        },
        orderBy: {
            createdAt: `desc`,
        },
    });
    return result;
};

export default {
    insertLog,
    getLogs,
};
