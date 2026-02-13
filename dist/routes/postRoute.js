"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = __importDefault(require("../controllers/postController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// get all posts or filter by owner id 
router.get("/", postController_1.default.getAll.bind(postController_1.default));
// get posts by owner id 
router.get("/:id", postController_1.default.getById.bind(postController_1.default));
// upload a post (requires authentication)
router.post("/", authMiddleware_1.authenticate, postController_1.default.create.bind(postController_1.default));
// delete a post (requires authentication)
router.delete("/:id", authMiddleware_1.authenticate, postController_1.default.del.bind(postController_1.default));
// update a post (requires authentication)
router.put("/:id", authMiddleware_1.authenticate, postController_1.default.update.bind(postController_1.default));
exports.default = router;
//# sourceMappingURL=postRoute.js.map