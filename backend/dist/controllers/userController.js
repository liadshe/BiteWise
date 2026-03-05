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
const userModel_1 = __importDefault(require("../models/userModel"));
const baseController_1 = __importDefault(require("./baseController"));
class UserController extends baseController_1.default {
    constructor() {
        super(userModel_1.default);
    }
    // Override update method to ensure only authenticated user can update their profile
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                // Ensure the authenticated user is updating their own profile
                if (!req.user || req.user._id.toString() !== id) {
                    res.status(403).send("Forbidden: You can only update your own profile");
                    return;
                }
                // If an image file is uploaded, set the imgUrl field to the file path
                if (req.file) {
                    req.body.imgUrl = req.file.path.replace(/\\/g, "/"); // Replace backslashes with forward slashes for consistency
                }
                // Pass the original req and res to the super method
                _super.update.call(this, req, res);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating user");
            }
        });
    }
}
exports.default = new UserController();
//# sourceMappingURL=userController.js.map