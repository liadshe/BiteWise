import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeNutrition = async (recipeData: any) => {
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

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("AI Analysis failed:", error);
        throw new Error("Failed to analyze nutrition");
    }
};