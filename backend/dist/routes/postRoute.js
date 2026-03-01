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
router.get("/", postController_1.default.getAll.bind(postController_1.default));
router.post("/analyze", authMiddleware_1.authenticate, postController_1.default.analyze.bind(postController_1.default));
router.get("/:id", postController_1.default.getById.bind(postController_1.default));
router.post("/", authMiddleware_1.authenticate, fileUpload_1.upload.single('image'), postController_1.default.create.bind(postController_1.default));
router.delete("/:id", authMiddleware_1.authenticate, postController_1.default.del.bind(postController_1.default));
router.put("/:id", authMiddleware_1.authenticate, postController_1.default.update.bind(postController_1.default));
router.post("/:id/like", authMiddleware_1.authenticate, postController_1.default.toggleLike.bind(postController_1.default));
exports.default = router;
//# sourceMappingURL=postRoute.js.map