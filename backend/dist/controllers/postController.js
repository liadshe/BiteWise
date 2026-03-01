"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postModel_1 = __importDefault(require("../models/postModel"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
const baseController_1 = __importDefault(require("./baseController"));
const aiService_1 = require("../services/aiService");
class PostsController extends baseController_1.default {
    constructor() {
        super(postModel_1.default);
    }
    analyze(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nutritionData = yield (0, aiService_1.analyzeNutrition)(req.body);
                res.status(200).json(nutritionData);
            }
            catch (err) {
                res.status(500).json({ error: "Failed to analyze recipe" });
            }
        });
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryObj = Object.assign({}, req.query);
                const excludedFields = ['page', 'limit', 'search'];
                excludedFields.forEach(el => delete queryObj[el]);
                let query = this.model.find(queryObj).populate('owner', 'username imgUrl').lean();
                if (req.query.page) {
                    const page = parseInt(req.query.page) || 1;
                    const limit = parseInt(req.query.limit) || 10;
                    const skip = (page - 1) * limit;
                    query = query.skip(skip).limit(limit);
                }
                const posts = yield query;
                // count comments for each post and add commentsCount field to the response
                const postsWithCommentsCount = yield Promise.all(posts.map((post) => __awaiter(this, void 0, void 0, function* () {
                    const commentsCount = yield commentModel_1.default.countDocuments({ postId: post._id });
                    return Object.assign(Object.assign({}, post), { commentsCount });
                })));
                res.json(postsWithCommentsCount);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving posts");
            }
        });
    }
    ;
    // Override create method to associate post with authenticated user
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (req.file) {
                req.body.imgUrl = req.file.path.replace(/\\/g, "/");
            }
            else if (!req.body.imgUrl) {
                res.status(400).send("An image is required");
                return;
            }
            // Parse JSON strings sent from FormData
            try {
                if (req.body.nutrition)
                    req.body.nutrition = JSON.parse(req.body.nutrition);
                if (req.body.ingredients)
                    req.body.ingredients = JSON.parse(req.body.ingredients);
                if (req.body.instructions)
                    req.body.instructions = JSON.parse(req.body.instructions);
            }
            catch (err) {
                console.error("Error parsing form data arrays", err);
                res.status(400).send("Invalid data format");
                return;
            }
            if (req.user) {
                req.body.owner = req.user._id;
                req.body.likes = [];
                req.body.createdAt = new Date();
            }
            return _super.create.call(this, req, res);
        });
    }
    // Override DELETE to ensure only creator can delete
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (!post) {
                    res.status(404).send("Post not found");
                    return;
                }
                // Check if the authenticated user is the creator of the post
                if (req.user && post.owner.toString() === req.user._id.toString()) {
                    _super.del.call(this, req, res);
                    return;
                }
                else {
                    res.status(403).send("Forbidden: You are not the creator of this post");
                    return;
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting post");
            }
        });
    }
    ;
    // Override PUT to prevent changing owner
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (!post) {
                    res.status(404).send("Post not found");
                    return;
                }
                // Prevent changing owner field
                if (req.body.owner && req.body.owner !== post.owner.toString()) {
                    res.status(400).send("Cannot change owner of the post");
                    return;
                }
                _super.update.call(this, req, res);
                return;
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating post");
            }
        });
    }
    ;
    // hendler for toggling like/unlike on a post
    toggleLike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const postId = req.params.id;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(401).send("Unauthorized");
                }
                const post = yield this.model.findById(postId);
                if (!post) {
                    return res.status(404).send("Post not found");
                }
                // check if user has already liked the post
                const index = post.likes.indexOf(userId);
                if (index === -1) {
                    // user has not liked the post - add like
                    post.likes.push(userId);
                }
                else {
                    // user has already liked the post - remove like
                    post.likes.splice(index, 1);
                }
                yield post.save();
                res.status(200).json(post);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error toggling like");
            }
        });
    }
}
exports.default = new PostsController();
//# sourceMappingURL=postController.js.map