"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const fileUpload_1 = require("../middleware/fileUpload");
const router = express_1.default.Router();
router.get("/:id", userController_1.default.getById.bind(userController_1.default));
router.put("/:id", authMiddleware_1.authenticate, fileUpload_1.upload.single('image'), userController_1.default.update.bind(userController_1.default));
exports.default = router;
//# sourceMappingURL=userRoute.js.map