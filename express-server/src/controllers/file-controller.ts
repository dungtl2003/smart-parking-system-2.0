import {Request, Response} from "express";
import path from "path";
import videoService from "@/services/video-service";
import {ResponseMessage} from "@/common/constants";
import fs from "fs";

const VIDEOS_DIR = "../../uploads";

const uploadVideo = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({message: "No file uploaded"});
    }
    const fileName = req.file.filename as string;
    const videoPath = path.join(__dirname, VIDEOS_DIR, fileName);

    //get datetime
    const dateString = fileName.split("_")[1];
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1;
    const day = parseInt(dateString.slice(6, 8), 10);
    const hour = parseInt(dateString.slice(8, 10), 10);
    const minute = parseInt(dateString.slice(10, 12), 10);
    const second = parseInt(dateString.slice(12, 14), 10);

    const createdAt = new Date(year, month, day, hour, minute, second);
    const videoId = await videoService.insertVideo({createdAt: createdAt});

    fs.renameSync(
        videoPath,
        path.join(__dirname, VIDEOS_DIR, `${videoId}.mp4`)
    );

    return res.status(200).json({
        message: ResponseMessage.SUCCESS,
        filePath: videoPath,
    });
};

const getVideos = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const currentPage = Number(req.query.currentPage) || 1;
    const fromDate =
        typeof req.query.from == "string"
            ? parseDate(req.query.from)
            : undefined;
    const toDate =
        typeof req.query.to == "string" ? parseDate(req.query.to) : undefined;

    console.log(fromDate, toDate);
    const videos = await videoService.getVideos({
        fromDate: fromDate,
        toDate: toDate,
        limit: limit,
        currentPage: currentPage,
    });

    const counter = await videoService.getNumberOfVideos({
        fromDate: fromDate,
        toDate: toDate,
    });
    return res.status(200).json({
        message: ResponseMessage.SUCCESS,
        info: {videos: videos, numberOfVideos: counter},
    });
};

const getVideo = (req: Request, res: Response) => {
    const fileName = req.params.id as string;
    const videoPath = path.join(__dirname, VIDEOS_DIR, `${fileName}.mp4`);

    if (!fs.existsSync(videoPath)) {
        return res.status(404).send("Video not found");
    }

    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;

    res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath).pipe(res);
};

const parseDate = (dateString: string): Date | undefined => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) {
        return undefined;
    }

    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export default {uploadVideo, getVideos, getVideo};
