"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = __importDefault(require("../controllers/commentController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The comments managing API
 */
/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve all comments. Can be filtered by post ID or owner ID using query parameters.
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the post to get comments for
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the user who owns the comments
 *     responses:
 *       200:
 *         description: A list of comments retrieved successfully
 *       500:
 *         description: Server error
 */
// get all comments (handles query params like ?postId= or ?owner=)
router.get("/", commentController_1.default.getAll.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment data retrieved successfully
 *       404:
 *         description: Comment not found
 */
// get comment by id
router.get("/:id", commentController_1.default.getById.bind(commentController_1.default));
/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post this comment belongs to
 *               content:
 *                 type: string
 *                 description: The text content of the comment
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// add new comment
router.post("/", authMiddleware_1.authenticate, commentController_1.default.create.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
// delete comment by id
router.delete("/:id", authMiddleware_1.authenticate, commentController_1.default.del.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated text content of the comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
// update comment by id
router.put("/:id", authMiddleware_1.authenticate, commentController_1.default.update.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentRoute.js.map