import express from "express";
import userController from "@/controllers/user-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";

const router = express.Router();

router.post(
    "/login",
    expressSchemaValidator("/users/login"),
    userController.login
);
router.get("/logout", userController.logout);
router.get("/refresh", userController.refreshToken);
router.get("/:id", authMiddleware.isAuthorized, userController.getUser);

export default router;
