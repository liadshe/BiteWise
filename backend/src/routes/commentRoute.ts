import express from "express";
import commentsController from "../controllers/commentController";
import { authenticate} from "../middleware/authMiddleware";

const router = express.Router();

// get all comments
router.get("/", commentsController.getAll.bind(commentsController));

// get comment by id
router.get("/:id", commentsController.getById.bind(commentsController));

// get comments by postId
router.get("/:postId", commentsController.getCommentsByPostId.bind(commentsController));

// add new comment
router.post("/", authenticate, commentsController.create.bind(commentsController));

// delete comment by id
router.delete("/:id", authenticate, commentsController.del.bind(commentsController));

// update comment by id
router.put("/:id", authenticate, commentsController.update.bind(commentsController));

export default router;