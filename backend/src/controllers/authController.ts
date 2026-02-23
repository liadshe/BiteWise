import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import jwt from "jsonwebtoken";

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
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;

    if (!email || !password || !username) {
        return sendError(400, "Email, password and username are required", res);
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ "email": email, "password": hashedPassword, "username": username });
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
            return sendError(401, "Invalid email or password 1", res);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid email or password 2", res);
        }

        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json({ ...tokens, _id: user._id });

    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
}

//refresh token function to be implemented
const refreshToken = async (req: Request, res: Response) => {
    // Refresh token logic here
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
        // Check if the refresh token exists in the user's refreshTokens array
        if (!user.refreshTokens.includes(refreshToken)) {
            //clear the refresh tokens array and save
            user.refreshTokens = [];
            await user.save();
            console.log(" **** Possible token theft for user:", user._id);
            return sendError(401, "Invalid refresh token", res);
        }
        const tokens = generateToken(decoded._id);
        //remove old token from user refreshTokens and add the new one
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(tokens);
    } catch (err) {
        return sendError(401, "Invalid refresh token", res);
    }
};


export default {
    register,
    login,
    refreshToken
};