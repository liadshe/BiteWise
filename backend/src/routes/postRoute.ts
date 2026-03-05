import express from "express";
import postController from "../controllers/postController";
import { authenticate } from "../middleware/authMiddleware";
import { upload } from "../middleware/fileUpload"; 

const router = express.Router();

router.get("/", postController.getAll.bind(postController));

router.post("/analyze", authenticate, postController.analyze.bind(postController));

router.get("/:id", postController.getById.bind(postController));

router.post("/", authenticate, upload.single('image'), postController.create.bind(postController));

router.delete("/:id", authenticate, postController.del.bind(postController));
router.put("/:id", authenticate, upload.single('image'), postController.update.bind(postController));
router.post("/:id/like", authenticate, postController.toggleLike.bind(postController));

export default router;