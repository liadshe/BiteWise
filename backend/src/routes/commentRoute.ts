import express from "express";
import commentsController from "../controllers/commentController";
import { authenticate} from "../middleware/authMiddleware";

const router = express.Router();

// get all comments by post id
router.get("/", commentsController.getCommentsByPostId.bind(commentsController));

// get comment by id
router.get("/:id", commentsController.getById.bind(commentsController));


// add new comment
router.post("/", authenticate, commentsController.create.bind(commentsController));

// delete comment by id
router.delete("/:id", authenticate, commentsController.del.bind(commentsController));

// update comment by id
router.put("/:id", authenticate, commentsController.update.bind(commentsController));

export default router;