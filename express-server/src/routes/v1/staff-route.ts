import express from "express";
import userController from "@/controllers/user-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";

const router = express.Router();
router.use(authMiddleware.isAuthorized, authMiddleware.isAdmin);

router.get("/", userController.getStaffs);
router.post(
    "/signup",
    expressSchemaValidator("/staffs/signup"),
    userController.insertStaff
);
router.delete("/:id", userController.deleteUser);

export default router;
