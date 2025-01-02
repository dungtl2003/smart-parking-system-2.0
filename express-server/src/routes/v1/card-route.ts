import express from "express";
import {expressSchemaValidator} from "@/middleware/schema-validator";
import {authMiddleware} from "@/middleware/auth-middleware";
import cardController from "@/controllers/card-controller";
const router = express.Router();

router.get("/", cardController.getCards);
router.post(
    "/",
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    expressSchemaValidator("/cards"),
    cardController.insertCard
);
router.put(
    "/:id",
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    expressSchemaValidator("/cards/:id"),
    cardController.updateCard
);
router.delete(
    "/:id",
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    cardController.deleteCard
);
router.get("/linked-vehicle", cardController.validateCard);

export default router;
