import Post from "../models/postModel";
import Comment from "../models/commentModel";
import { Request, Response } from "express"; 
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";
import { analyzeNutrition } from "../services/aiService";
import mongoose from "mongoose"

class PostsController extends baseController {
    constructor() {
        super(Post);
    }

    async analyze(req: Request, res: Response) {
        try {
            const nutritionData = await analyzeNutrition(req.body);
            res.status(200).json(nutritionData);
        } catch (err) {
            res.status(500).json({ error: "Failed to analyze recipe" });
        }
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

    // Override getById to populate the owner data
    async getById(req: Request, res: Response) {
        try {
            const post = await this.model.findById(req.params.id).populate('owner', 'username imgUrl').lean();
            
            if (!post) {
                return res.status(404).send("Post not found");
            }
            
            res.status(200).json(post);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving post");
        }
    }

    async getPostsByUserId(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const posts = await this.model.find({ owner: userId }).populate('owner', 'username imgUrl').lean();
            res.status(200).json(posts);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving user's posts");
        }
    }

// Override create method to associate post with authenticated user
    async create(req: AuthRequest, res: Response) {
        if (req.file) {
            req.body.imgUrl = req.file.path.replace(/\\/g, "/"); 
        } else if (!req.body.imgUrl) {
             res.status(400).send("An image is required");
             return;
        }

        // Parse JSON strings sent from FormData
        try {
            if (req.body.nutrition) req.body.nutrition = JSON.parse(req.body.nutrition);
            if (req.body.ingredients) req.body.ingredients = JSON.parse(req.body.ingredients);
            if (req.body.instructions) req.body.instructions = JSON.parse(req.body.instructions);
        } catch (err) {
            console.error("Error parsing form data arrays", err);
            res.status(400).send("Invalid data format");
            return;
        }

        if (req.user) {
            // Explicitly cast the string to a MongoDB ObjectId
            req.body.owner = new mongoose.Types.ObjectId(req.user._id as string); 
            req.body.likes = []; 
            req.body.createdAt = new Date(); 
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

// Override PUT to secure ownership and handle FormData updates
    async update(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const id = authReq.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            // SECURITY: Ensure the logged-in user is the actual owner of the post
            if (authReq.user && post.owner.toString() !== authReq.user._id.toString()) {
                res.status(403).send("Forbidden: You can only edit your own recipes");
                return;
            }

            // SAFETY NET: If multer didn't parse a body, initialize it so the app doesn't crash
            if (!authReq.body) {
                authReq.body = {};
            }

            // Handle new image if one was uploaded
            if (authReq.file) {
                authReq.body.imgUrl = authReq.file.path.replace(/\\/g, "/"); 
            }

            // Parse JSON strings sent from FormData 
            if (authReq.body.nutrition && typeof authReq.body.nutrition === 'string') authReq.body.nutrition = JSON.parse(authReq.body.nutrition);
            if (authReq.body.ingredients && typeof authReq.body.ingredients === 'string') authReq.body.ingredients = JSON.parse(authReq.body.ingredients);
            if (authReq.body.instructions && typeof authReq.body.instructions === 'string') authReq.body.instructions = JSON.parse(authReq.body.instructions);

            // Strip the owner field from req.body entirely so it can never be accidentally modified
            delete authReq.body.owner;

            // Pass the original req and res to the super method
            super.update(req, res);
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