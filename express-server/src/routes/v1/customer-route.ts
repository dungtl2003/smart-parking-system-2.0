import express from "express";
import userController from "@/controllers/user-controller";
import {authMiddleware} from "@/middleware/auth-middleware";
import {expressSchemaValidator} from "@/middleware/schema-validator";

const router = express.Router();
router.use(authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin);

router.get("/", userController.getCustomers);
router.post(
    "/signup",
    expressSchemaValidator("/customers/signup"),
    userController.insertCustomer
);
router.put(
    "/:id",
    expressSchemaValidator("/customers/:id"),
    userController.updateInfo
);
router.delete("/:id", userController.deleteUser);

export default router;
