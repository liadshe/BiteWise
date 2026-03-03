import express from "express";
import authController from "../controllers/authController";
import { upload } from "../middleware/fileUpload";

const router = express.Router();

router.post("/login", authController.login);
router.post('/register', upload.single('image'), authController.register);
router.post("/refresh", authController.refreshToken);
router.get('/:id', authController.getUserById);
router.post('/google', authController.googleLogin);

export default router;