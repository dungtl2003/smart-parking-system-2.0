import express from "express";
import {authMiddleware} from "@/middleware/auth-middleware";
import cardLogController from "@/controllers/card-log-controller";
const router = express.Router();

router.get("/", authMiddleware.isAuthorized, cardLogController.getLogs);

export default router;
