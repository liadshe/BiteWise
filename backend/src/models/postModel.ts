import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    cuisine: { type: String, required: true },
    imgUrl: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ingredients: [{
        name: String,
        amount: String
    }],
    instructions: [String],
    nutrition: {  
        calories: Number,
        protein: Number,
        confidence: Number,
        suggestions: String
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', postSchema);