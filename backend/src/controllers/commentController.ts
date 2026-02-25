import commentsModel from "../models/commentModel";
import { Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class CommentsController extends baseController {
    constructor() {
        super(commentsModel);
    }

    // Override create method to associate comment with authenticated user
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.owner = req.user._id; // Associate comment with user ID from token
        }
        return super.create(req, res);
    }

    // Override DELETE to ensure only creator can delete
    async del(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the comment
            if (req.user && comment.owner.toString() === req.user._id) {
                super.del(req, res);
                return;
            } else {
                res.status(403).send("Forbidden: You are not the creator of this comment");
                return;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting comment");
        }
    }

    // Override update to prevent changing owner and ensure ownership
    async update(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the comment
            if (!req.user || comment.owner.toString() !== req.user._id) {
                res.status(403).send("Forbidden: You are not the creator of this comment");
                return;
            }
            // Prevent changing owner field
            if (req.body.owner && req.body.owner !== comment.owner.toString()) {
                res.status(400).send("Cannot change creator of the comment");
                return;
            }
            super.update(req, res);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).send("Error updating comment");
        }
    }

    async getCommentsByPostId(req: AuthRequest, res: Response) {
        const postId = req.query.postId;
        if (!postId) {
            res.status(400).send("postId is required");
            return;
        }
        try {
            const comments = await this.model.find({ postId: postId });
            res.status(200).json(comments);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving comments");
        }
    };
}

export default new CommentsController();