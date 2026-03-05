import express from "express";
import userController from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import { upload } from "../middleware/fileUpload"; 

const router = express.Router();

router.get("/:id", userController.getById.bind(userController));

router.put("/:id", authenticate, upload.single('image'), userController.update.bind(userController));

export default router;