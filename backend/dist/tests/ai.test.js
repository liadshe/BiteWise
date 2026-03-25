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
const aiService_1 = require("../services/aiService");
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
        test("Should return a parsed JSON object on success", () => __awaiter(void 0, void 0, void 0, function* () {
            _mGenerateContent.mockResolvedValueOnce({
                response: { text: () => '{"calories": 400, "protein": 25, "confidence": 90, "suggestions": "Add broccoli"}' }
            });
            const recipeData = { title: "Test", description: "Test", ingredients: [], instructions: [] };
            const result = yield (0, aiService_1.analyzeNutrition)(recipeData);
            expect(result.calories).toBe(400);
            expect(result.protein).toBe(25);
        }));
        test("Should throw an error if the AI API fails", () => __awaiter(void 0, void 0, void 0, function* () {
            _mGenerateContent.mockRejectedValueOnce(new Error("Gemini is down"));
            yield expect((0, aiService_1.analyzeNutrition)({})).rejects.toThrow("Failed to analyze nutrition");
        }));
    });
    describe("generateMongoQuery", () => {
        test("Should return a parsed Mongo query object on success", () => __awaiter(void 0, void 0, void 0, function* () {
            _mGenerateContent.mockResolvedValueOnce({
                response: { text: () => '{"cuisine": "Mexican", "nutrition.calories": { "$lt": 500 }}' }
            });
            const result = yield (0, aiService_1.generateMongoQuery)("healthy mexican food");
            expect(result.cuisine).toBe("Mexican");
        }));
        test("Should return an empty object if Gemini returns invalid JSON", () => __awaiter(void 0, void 0, void 0, function* () {
            _mGenerateContent.mockResolvedValueOnce({
                response: { text: () => 'Here is your query: {"cuisine": "Italian"' } // Broken JSON
            });
            const result = yield (0, aiService_1.generateMongoQuery)("italian");
            expect(result).toEqual({});
        }));
        test("Should return an empty object on general AI error", () => __awaiter(void 0, void 0, void 0, function* () {
            _mGenerateContent.mockRejectedValueOnce(new Error("Standard API Error"));
            const result = yield (0, aiService_1.generateMongoQuery)("asian");
            expect(result).toEqual({});
        }));
        test("Should catch a 429 Rate Limit error and return an empty object", () => __awaiter(void 0, void 0, void 0, function* () {
            const rateLimitError = new Error("Too Many Requests");
            rateLimitError.status = 429;
            _mGenerateContent.mockRejectedValueOnce(rateLimitError);
            const result = yield (0, aiService_1.generateMongoQuery)("israeli");
            expect(result).toEqual({});
        }));
    });
});
//# sourceMappingURL=ai.test.js.map