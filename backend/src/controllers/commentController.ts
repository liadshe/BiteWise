import commentsModel from "../models/commentModel";
import { Response, Request } from "express";
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
    async del(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const id = authReq.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the comment
            // FIX: Added .toString() to authReq.user._id
            if (authReq.user && comment.owner.toString() === authReq.user._id.toString()) {
                super.del(req, res);
            } else {
                res.status(403).send("Forbidden: You are not the creator of this comment");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting comment");
        }
    }

    // Override update to prevent changing owner and ensure ownership
    async update(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const id = authReq.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            // Check if the authenticated user is the creator of the comment
            // FIX: Added .toString() to authReq.user._id
            if (!authReq.user || comment.owner.toString() !== authReq.user._id.toString()) {
                res.status(403).send("Forbidden: You are not the creator of this comment");
                return;
            }
            
            // FIX: Strip the owner field from the body to prevent tampering
            if (authReq.body.owner) {
                delete authReq.body.owner;
            }
            
            super.update(req, res);
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
            const comments = await this.model.find({ postId: postId })
                .populate('owner', 'username imgUrl')
                .sort({ createdAt: -1 });
                
            res.status(200).json(comments);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving comments");
        }
    };
}

export default new CommentsController();