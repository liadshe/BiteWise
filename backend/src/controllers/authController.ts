import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendError = (code: number, message: string, res: Response) => {
    res.status(code).json({ message });
}

type GeneratedTokens = {
    token: string,
    refreshToken: string
};

const generateToken = (userId: string): GeneratedTokens => {
    const tokenSecret = process.env.TOKEN_SECRET || "default_secret";
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "default_secret";
    const expiresIn = parseInt(process.env.TOKEN_EXPIRATION || "3600");
    const refreshExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || "1440");
    
  
    const rand = Math.floor(Math.random() * 1000);
    
    const token = jwt.sign(
    { _id: userId },
    tokenSecret,
   { expiresIn: expiresIn}
    );

    const refreshToken = jwt.sign(
    { _id: userId, rand },
    refreshTokenSecret,
    { expiresIn: refreshExpiresIn }
);

    return { token, refreshToken };
}

const register = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return sendError(400, "Email, password and username are required", res);
    }
    try {
        const existingUser = await User.findOne({ email });
        const imgUrl = req.file ? req.file.path : "";
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            email,
            password: hashedPassword,
            username,
            imgUrl: imgUrl 
        });

        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(201).json({ ...tokens, _id: user._id });
    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
}
const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return sendError(401, "Invalid email", res);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid password", res);
        }

        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json({ ...tokens, _id: user._id, username: user.username, imgUrl: user.imgUrl });

    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
}

const googleLogin = async (req: Request, res: Response) => {
    const { credential } = req.body;
    try {
        console.log("מנסה לאמת טוקן עם Client ID:", process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return sendError(400, "Invalid Google token", res);
        }

        let user = await User.findOne({ email: payload.email });

        if (!user) {
            user = await User.create({
                email: payload.email,
                username: payload.name || payload.email,
                password: "google-auth-" + Math.random().toString(36).slice(-8),
                imgUrl: payload.picture || ""
            });
        }

        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        
        res.status(200).json({ 
            accessToken: tokens.token, 
            refreshToken: tokens.refreshToken, 
            _id: user._id,
            username: user.username,
            imgUrl: user.imgUrl
        });
    } catch (err) {
        console.error("שגיאת אימות גוגל מפורטת:", err); // זה ידפיס לך בטרמינל למה זה נכשל
        return sendError(400, "Google authentication failed", res);
    }
};

const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }
    const secret = process.env.REFRESH_TOKEN_SECRET || "default_secret";
    try {
        const decoded = jwt.verify(refreshToken, secret) as { _id: string };
        const user = await User.findById(decoded._id);
        if (!user) {
            return sendError(401, "Invalid refresh token", res);
        }
        if (!user.refreshTokens.includes(refreshToken)) {
            user.refreshTokens = [];
            await user.save();
            console.log(" **** Possible token theft for user:", user._id);
            return sendError(401, "Invalid refresh token", res);
        }
        const tokens = generateToken(decoded._id);
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(tokens);
    } catch (err) {
        return sendError(401, "Invalid refresh token", res);
    }
};

const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-password -refreshTokens");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export default {
    register,
    login,
    googleLogin,
    refreshToken,
    getUserById
};