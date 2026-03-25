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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMongoQuery = exports.analyzeNutrition = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const analyzeNutrition = (recipeData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `
        You are an expert nutritionist. Analyze the following recipe and estimate the nutritional value per serving.
        
        Title: ${recipeData.title}
        Description: ${recipeData.description}
        Ingredients: ${JSON.stringify(recipeData.ingredients)}
        Instructions: ${JSON.stringify(recipeData.instructions)}

        Return exactly ONE JSON object with no extra text, using this exact structure:
        {
            "calories": <estimated integer number of calories>,
            "protein": <estimated integer number of protein in grams>,
            "confidence": <integer between 0 and 100 representing confidence>,
            "suggestions": "<a short 1-sentence tip to make it healthier>"
        }`;
        const result = yield model.generateContent(prompt);
        return JSON.parse(result.response.text());
    }
    catch (error) {
        console.error("AI Analysis failed:", error);
        throw new Error("Failed to analyze nutrition");
    }
});
exports.analyzeNutrition = analyzeNutrition;
const generateMongoQuery = (userText) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `
        You are a MongoDB expert. Convert the user's natural language search into a MongoDB filter object for a collection named 'posts'.
        
        The schema is:
        - title: String
        - description: String
        - cuisine: String (e.g., 'Italian', 'Mexican', 'Asian', 'Israeli')
        - ingredients: Array of objects { name: String, amount: String }
        - nutrition: Object { calories: Number, protein: Number }

        Guidelines:
        1. Use $regex with 'i' option for partial string matches in title or description.
        2. For ingredients, search within the 'ingredients.name' field.
        3. If the user mentions nutrition (e.g., "low calorie"), use $lt (less than) for calories.
        4. If the user mentions "rich in protein", use $gt (greater than) for protein.

        User search: "${userText}"

        Return ONLY a JSON object compatible with mongoose find().
        Example: { "cuisine": "Italian", "nutrition.calories": { "$lt": 500 } }
        `;
        const result = yield model.generateContent(prompt);
        const responseText = result.response.text();
        // Attempt to parse the AI response as JSON, but if it fails, log the raw text for debugging
        try {
            return JSON.parse(responseText);
        }
        catch (e) {
            console.error("AI returned non-JSON text:", responseText);
            return {};
        }
        // Returm AI error
    }
    catch (error) {
        console.error("Detailed AI Error:", error.message || error);
        // Return indicative AI error rate limit
        if (error.status === 429)
            console.error("Rate limit exceeded - slow down!");
        return {};
    }
});
exports.generateMongoQuery = generateMongoQuery;
//# sourceMappingURL=aiService.js.map