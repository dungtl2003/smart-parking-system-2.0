import express from "express";
import parkingSlotController from "@/controllers/parking-slot-controller";
const router = express.Router();

router.get("/", parkingSlotController.getParkingSlots);
router.post("/", parkingSlotController.initParkingSlots);
router.put("/", parkingSlotController.updateParkingSlots);

export default router;
