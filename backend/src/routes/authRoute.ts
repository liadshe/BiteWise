import express from "express";
import authController from "../controllers/authController";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh", authController.refreshToken);
router.get('/:id', authController.getUserById);

export default router;