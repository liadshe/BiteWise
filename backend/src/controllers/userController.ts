import User from "../models/userModel";
import { Request, Response } from "express"; 
import baseController from "./baseController";
import { AuthRequest } from "../middleware/authMiddleware";


class UserController extends baseController {
    constructor() {
        super(User);
    }

    // Override update method to ensure only authenticated user can update their profile
    async update(req: AuthRequest, res: Response) {
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
            super.update(req, res);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error updating user");
        }
    }

}

export default new UserController();