import Post from "../models/postModel";
import { Response } from "express";
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class PostsController extends baseController {
    constructor() {
        super(Post);
    }

    // Override create method to associate post with authenticated user
    async create(req: AuthRequest, res: Response) {
        if (req.user) {
            req.body.owner = req.user._id; // Associate post with user ID from token
        }
        return super.create(req, res);
    }

    // Override DELETE to ensure only creator can delete
    async del(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            // Check if the authenticated user is the creator of the post
            if (req.user && post.owner.toString() === req.user._id.toString()) {
                super.del(req, res);
                return
            } else {
                res.status(403).send("Forbidden: You are not the creator of this post");
                return;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    };

    // Override PUT to prevent changing owner
    async update(req: AuthRequest, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            // Prevent changing owner field
            if (req.body.owner && req.body.owner !== post.owner.toString()) {
                res.status(400).send("Cannot change owner of the post");
                return;
            }
            super.update(req, res);
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Error updating post");
        }
    };
}

export default new PostsController();