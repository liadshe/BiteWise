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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const baseController_1 = __importDefault(require("./baseController"));
class CommentsController extends baseController_1.default {
    constructor() {
        super(commentModel_1.default);
    }
    // Override create method to associate comment with authenticated user
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (req.user) {
                req.body.owner = req.user._id; // Associate comment with user ID from token
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
            const authReq = req;
            const id = authReq.params.id;
            try {
                const comment = yield this.model.findById(id);
                if (!comment) {
                    res.status(404).send("Comment not found");
                    return;
                }
                // Check if the authenticated user is the creator of the comment
                // FIX: Added .toString() to authReq.user._id
                if (authReq.user && comment.owner.toString() === authReq.user._id.toString()) {
                    _super.del.call(this, req, res);
                }
                else {
                    res.status(403).send("Forbidden: You are not the creator of this comment");
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting comment");
            }
        });
    }
    // Override update to prevent changing owner and ensure ownership
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const authReq = req;
            const id = authReq.params.id;
            try {
                const comment = yield this.model.findById(id);
                if (!comment) {
                    res.status(404).send("Comment not found");
                    return;
                }
                // Check if the authenticated user is the creator of the comment
                // FIX: Added .toString() to authReq.user._id
                if (!authReq.user || comment.owner.toString() !== authReq.user._id.toString()) {
                    res.status(403).send("Forbidden: You are not the creator of this comment");
                    return;
                }
                // FIX: Strip the owner field from the body to prevent tampering
                if (authReq.body.owner) {
                    delete authReq.body.owner;
                }
                _super.update.call(this, req, res);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating comment");
            }
        });
    }
    getCommentsByPostId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.query.postId;
            if (!postId) {
                res.status(400).send("postId is required");
                return;
            }
            try {
                const comments = yield this.model.find({ postId: postId })
                    .populate('owner', 'username imgUrl')
                    .sort({ createdAt: -1 });
                res.status(200).json(comments);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving comments");
            }
        });
    }
    ;
}
exports.default = new CommentsController();
//# sourceMappingURL=commentController.js.map