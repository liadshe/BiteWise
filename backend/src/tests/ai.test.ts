import { analyzeNutrition, generateMongoQuery } from "../services/aiService";

// 1. We define our mock inside the factory so it doesn't crash from hoisting,
// and we export it as _mGenerateContent so we can change its behavior below.
jest.mock("@google/generative-ai", () => {
  const mGenerateContent = jest.fn();
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: mGenerateContent,
      })),
    })),
    _mGenerateContent: mGenerateContent, 
  };
});

// 2. Import the exposed mock function so we can control it
const { _mGenerateContent } = require("@google/generative-ai");

describe("AI Service Unit Tests", () => {
  
  beforeEach(() => {
    _mGenerateContent.mockClear();
  });

  describe("analyzeNutrition", () => {
    test("Should return a parsed JSON object on success", async () => {
      _mGenerateContent.mockResolvedValueOnce({
        response: { text: () => '{"calories": 400, "protein": 25, "confidence": 90, "suggestions": "Add broccoli"}' }
      });

      const recipeData = { title: "Test", description: "Test", ingredients: [], instructions: [] };
      const result = await analyzeNutrition(recipeData);

      expect(result.calories).toBe(400);
      expect(result.protein).toBe(25);
    });

    test("Should throw an error if the AI API fails", async () => {
      _mGenerateContent.mockRejectedValueOnce(new Error("Gemini is down"));
      await expect(analyzeNutrition({})).rejects.toThrow("Failed to analyze nutrition");
    });
  });

  describe("generateMongoQuery", () => {
    test("Should return a parsed Mongo query object on success", async () => {
      _mGenerateContent.mockResolvedValueOnce({
        response: { text: () => '{"cuisine": "Mexican", "nutrition.calories": { "$lt": 500 }}' }
      });

      const result = await generateMongoQuery("healthy mexican food");
      expect(result.cuisine).toBe("Mexican");
    });

    test("Should return an empty object if Gemini returns invalid JSON", async () => {
      _mGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'Here is your query: {"cuisine": "Italian"' } // Broken JSON
      });

      const result = await generateMongoQuery("italian");
      expect(result).toEqual({}); 
    });

    test("Should return an empty object on general AI error", async () => {
      _mGenerateContent.mockRejectedValueOnce(new Error("Standard API Error"));
      const result = await generateMongoQuery("asian");
      expect(result).toEqual({});
    });

    test("Should catch a 429 Rate Limit error and return an empty object", async () => {
      const rateLimitError: any = new Error("Too Many Requests");
      rateLimitError.status = 429;
      
      _mGenerateContent.mockRejectedValueOnce(rateLimitError);

      const result = await generateMongoQuery("israeli");
      expect(result).toEqual({});
    });
  });
});