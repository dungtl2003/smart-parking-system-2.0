import prisma from "@/common/prisma-client";
import {Video} from "@prisma/client";

const insertVideo = async (validPayload: {
    createdAt: Date;
}): Promise<string> => {
    const video = await prisma.video.create({
        data: {
            createdAt: validPayload.createdAt,
        },
    });

    return video.videoId;
};

const getVideos = async (params: {
    fromDate?: Date;
    toDate?: Date;
    limit: number;
    currentPage: number;
}): Promise<Video[]> => {
    const startOfDate =
        params.fromDate && new Date(params.fromDate.setHours(0, 0, 0, 0));
    const endOfDate =
        params.toDate && new Date(params.toDate.setHours(23, 59, 59, 999));

    const videos = await prisma.video.findMany({
        where: {
            createdAt: {
                gte: startOfDate,
                lte: endOfDate,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: params.limit == 0 ? undefined : params.limit,
        skip: (params.currentPage - 1) * params.limit,
    });

    return videos;
};

const getNumberOfVideos = async (params: {
    fromDate?: Date;
    toDate?: Date;
}): Promise<number> => {
    const startOfDate =
        params.fromDate && new Date(params.fromDate.setHours(0, 0, 0, 0));
    const endOfDate =
        params.toDate && new Date(params.toDate.setHours(23, 59, 59, 999));

    const counter = await prisma.video.count({
        where: {
            createdAt: {
                gte: startOfDate,
                lte: endOfDate,
            },
        },
    });

    return counter;
};

export default {
    insertVideo,
    getVideos,
    getNumberOfVideos,
};
