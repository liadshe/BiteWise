import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
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