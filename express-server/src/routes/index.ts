import express, {Request, Response} from "express";
import userRoute from "@/routes/v1/user-route";
import customerRoute from "@/routes/v1/customer-route";
import staffRoute from "@/routes/v1/staff-route";
import cardRoute from "@/routes/v1/card-route";
import videoRoute from "@/routes/v1/video-route";
import vehicleRoute from "@/routes/v1/vehicle-route";
import parkingSlotsRoute from "@/routes/v1/parking-slot-route";
import {NextFunction} from "express-serve-static-core";

const router = express.Router();
const space = (req: Request, res: Response, next: NextFunction) => {
    console.log("\n");
    next();
};

router.use("/api/v1/users", space, userRoute);
router.use("/api/v1/customers", space, customerRoute);
router.use("/api/v1/staffs", space, staffRoute);
router.use("/api/v1/cards", space, cardRoute);
router.use("/api/v1/videos", space, videoRoute);
router.use("/api/v1/vehicles", space, vehicleRoute);
router.use("/api/v1/parking-slots", space, parkingSlotsRoute);
router.get("/healthcheck", (req: Request, res: Response) =>
    res.sendStatus(200)
);
export const API_v1 = router;
