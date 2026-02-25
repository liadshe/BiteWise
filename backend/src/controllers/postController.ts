import Post from "../models/postModel";
import Comment from "../models/commentModel";
import { Request, Response } from "express"; // ודאי ש-Request מיובא מכאן
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";

class PostsController extends baseController {
    constructor() {
        super(Post);
    }

   async getAll(req: Request, res: Response) {
        try {
            const queryObj = { ...req.query };
            const excludedFields = ['page', 'limit', 'search'];
            excludedFields.forEach(el => delete queryObj[el]);

            let query = this.model.find(queryObj).populate('owner', 'username imgUrl').lean();

            if (req.query.page) {
                const page = parseInt(req.query.page as string) || 1;
                const limit = parseInt(req.query.limit as string) || 10;
                const skip = (page - 1) * limit;
                query = query.skip(skip).limit(limit);
            }

            const posts = await query;

            // count comments for each post and add commentsCount field to the response
            const postsWithCommentsCount = await Promise.all(posts.map(async (post: any) => {
                const commentsCount = await Comment.countDocuments({ postId: post._id });
                return {
                    ...post,
                    commentsCount 
                };
            }));

            res.json(postsWithCommentsCount);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving posts");
        }
    };

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

    // hendler for toggling like/unlike on a post
    async toggleLike(req: AuthRequest, res: Response) {
        try {
            const postId = req.params.id;
            const userId = req.user?._id; 

            if (!userId) {
                return res.status(401).send("Unauthorized");
            }

            const post = await this.model.findById(postId);
            if (!post) {
                return res.status(404).send("Post not found");
            }

            // check if user has already liked the post
            const index = post.likes.indexOf(userId);
            if (index === -1) {
                // user has not liked the post - add like
                post.likes.push(userId);
            } else {
                // user has already liked the post - remove like
                post.likes.splice(index, 1);
            }

            await post.save();
            res.status(200).json(post);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error toggling like");
        }
    }
}

export default new PostsController();