"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User' // array of user IDs who liked the post
        }],
    nutrition: {
        calories: Number,
        protein: Number,
        suggestions: String
    }
});
exports.default = mongoose_1.default.model('Post', postSchema);
//# sourceMappingURL=postModel.js.map