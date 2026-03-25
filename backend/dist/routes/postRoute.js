"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = __importDefault(require("../controllers/postController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const fileUpload_1 = require("../middleware/fileUpload");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The posts managing API
 */
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the user to get posts for
 *     responses:
 *       200:
 *         description: A list of posts retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", postController_1.default.getAll.bind(postController_1.default));
/**
 * @swagger
 * /posts/analyze:
 *   post:
 *     summary: Analyze post content (placeholder for a special feature)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The text content to be analyzed.
 *     responses:
 *       200:
 *         description: Analysis successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/analyze", authMiddleware_1.authenticate, postController_1.default.analyze.bind(postController_1.default));
/**
 * @swagger
 * /posts/ai-search:
 *   post:
 *     summary: Perform an AI-based search on posts
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query for the AI.
 *     responses:
 *       200:
 *         description: Search results retrieved
 *       400:
 *         description: Bad request
 */
router.post("/ai-search", (req, res) => postController_1.default.aiSearch(req, res));
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post data retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get("/:id", postController_1.default.getById.bind(postController_1.default));
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware_1.authenticate, fileUpload_1.upload.single('image'), postController_1.default.create.bind(postController_1.default));
// get posts by user id
/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get all posts by a specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of posts for the user
 *       404:
 *         description: User not found
 */
router.get("/user/:userId", postController_1.default.getPostsByUserId.bind(postController_1.default));
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware_1.authenticate, postController_1.default.del.bind(postController_1.default));
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.put("/:id", authMiddleware_1.authenticate, fileUpload_1.upload.single('image'), postController_1.default.update.bind(postController_1.default));
/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post("/:id/like", authMiddleware_1.authenticate, postController_1.default.toggleLike.bind(postController_1.default));
exports.default = router;
//# sourceMappingURL=postRoute.js.map