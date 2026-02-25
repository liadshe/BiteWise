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
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendError = (code, message, res) => {
    res.status(code).json({ message });
};
const generateToken = (userId) => {
    const tokenSecret = process.env.TOKEN_SECRET || "default_secret";
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "default_secret";
    const expiresIn = parseInt(process.env.TOKEN_EXPIRATION || "3600");
    const refreshExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "1440");
    const rand = Math.floor(Math.random() * 1000);
    const token = jsonwebtoken_1.default.sign({ _id: userId }, tokenSecret, { expiresIn: expiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: userId, rand }, refreshTokenSecret, { expiresIn: refreshExpiresIn });
    return { token, refreshToken };
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    if (!email || !password || !username) {
        return sendError(400, "Email, password and username are required", res);
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield userModel_1.default.create({ "email": email, "password": hashedPassword, "username": username });
        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        res.status(201).json(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (err) {
        return sendError(500, "Internal server error", res);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const user = yield userModel_1.default.findOne({ email: email });
        if (!user) {
            return sendError(401, "Invalid email or password 1", res);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid email or password 2", res);
        }
        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        res.status(200).json(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (err) {
        return sendError(500, "Internal server error", res);
    }
});
//refresh token function to be implemented
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Refresh token logic here
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    const secret = process.env.REFRESH_TOKEN_SECRET || "default_secret";
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = yield userModel_1.default.findById(decoded._id);
        if (!user) {
            return sendError(401, "Invalid refresh token", res);
        }
        // Check if the refresh token exists in the user's refreshTokens array
        if (!user.refreshTokens.includes(refreshToken)) {
            //clear the refresh tokens array and save
            user.refreshTokens = [];
            yield user.save();
            console.log(" **** Possible token theft for user:", user._id);
            return sendError(401, "Invalid refresh token", res);
        }
        const tokens = generateToken(decoded._id);
        //remove old token from user refreshTokens and add the new one
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        res.status(200).json(tokens);
    }
    catch (err) {
        return sendError(401, "Invalid refresh token", res);
    }
});
exports.default = {
    register,
    login,
    refreshToken
};
//# sourceMappingURL=authController.js.map