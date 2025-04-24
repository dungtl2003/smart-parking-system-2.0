import express from "express";
import vehiclesController from "@/controllers/vehicle-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";
const router = express.Router();

router.use(authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin);

router.post("/", vehiclesController.insertVehicle);
router.put(
    "/:id",
    expressSchemaValidator("/vehicles/:id"),
    vehiclesController.updateVehicle
);
router.delete("/:id", vehiclesController.deleteVehicle);

export default router;
