import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true 
    },
    imgUrl: { 
        type: String, 
        required: true 
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' // array of user IDs who liked the post
    }],
    nutrition: {  // optional nutrition info from AI
        calories: Number,
        protein: Number,
        suggestions: String
    }
});

export default mongoose.model('Post', postSchema);