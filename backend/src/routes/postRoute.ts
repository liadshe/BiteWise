import express from "express";
import postController from "../controllers/postController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// get all posts or filter by owner id 
router.get("/", postController.getAll.bind(postController));

// get posts by owner id 
router.get("/:id", postController.getById.bind(postController));

// upload a post (requires authentication)
router.post("/", authenticate, postController.create.bind(postController)); 

// delete a post (requires authentication)
router.delete("/:id", authenticate, postController.del.bind(postController));

// update a post (requires authentication)
router.put("/:id", authenticate, postController.update.bind(postController));

// toggle like on a post (requires authentication)
router.post("/:id/like", authenticate, postController.toggleLike.bind(postController));

export default router;