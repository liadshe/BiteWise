import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    imgUrl: { 
        type: String 
    },
    refreshTokens: { 
        type: [String], // array of active refresh tokens
        default: [] 
    }
});

export default mongoose.model('User', userSchema);