"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const fileUpload_1 = require("../middleware/fileUpload");
const router = express_1.default.Router();
router.post("/login", authController_1.default.login);
router.post('/register', fileUpload_1.upload.single('image'), authController_1.default.register);
router.post("/refresh", authController_1.default.refreshToken);
router.get('/:id', authController_1.default.getUserById);
router.post('/google', authController_1.default.googleLogin);
exports.default = router;
//# sourceMappingURL=authRoute.js.map