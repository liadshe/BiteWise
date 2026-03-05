"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = __importDefault(require("../controllers/commentController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// get all comments by post id
router.get("/", commentController_1.default.getCommentsByPostId.bind(commentController_1.default));
// get comment by id
router.get("/:id", commentController_1.default.getById.bind(commentController_1.default));
// add new comment
router.post("/", authMiddleware_1.authenticate, commentController_1.default.create.bind(commentController_1.default));
// delete comment by id
router.delete("/:id", authMiddleware_1.authenticate, commentController_1.default.del.bind(commentController_1.default));
// update comment by id
router.put("/:id", authMiddleware_1.authenticate, commentController_1.default.update.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentRoute.js.map