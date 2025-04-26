import prisma from "@/common/prisma-client";
import {ScannedLog} from "@/common/types";
import {CheckinLog} from "@prisma/client";

const insertLog = async (validPayload: ScannedLog): Promise<void> => {
    await prisma.checkinLog.create({
        data: validPayload,
    });
};

const getLogs = async (params: {
    cardIds?: string[];
    userId: string | null;
}): Promise<CheckinLog[]> => {
    const result = await prisma.checkinLog.findMany({
        where: {
            cardId: {
                in: params.cardIds,
            },
            userId: params.userId || undefined,
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
