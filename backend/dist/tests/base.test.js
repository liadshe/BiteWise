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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseController_1 = __importDefault(require("../controllers/baseController"));
// 1. Create a fully mocked Mongoose model to pass into the BaseController
const mockQuery = Promise.resolve(["item1", "item2"]);
mockQuery.skip = jest.fn().mockReturnThis();
mockQuery.limit = jest.fn().mockReturnValue(Promise.resolve(["item1", "item2"]));
const mockModel = {
    find: jest.fn().mockReturnValue(mockQuery),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
};
// 2. Instantiate a generic controller using our mock model
class TestController extends baseController_1.default {
    constructor() {
        super(mockModel);
    }
}
const controller = new TestController();
describe("Base Controller Unit Tests", () => {
    let req;
    let res;
    // Reset our fake requests and responses before every test
    beforeEach(() => {
        req = { body: {}, query: {}, params: { id: "123" } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });
    describe("getAll", () => {
        test("Should return data without pagination", () => __awaiter(void 0, void 0, void 0, function* () {
            yield controller.getAll(req, res);
            expect(mockModel.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(["item1", "item2"]);
        }));
        test("Should handle pagination when page query is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            req.query = { page: "2", limit: "5" };
            yield controller.getAll(req, res);
            expect(mockQuery.skip).toHaveBeenCalledWith(5); // (page 2 - 1) * 5
            expect(mockQuery.limit).toHaveBeenCalledWith(5);
            expect(res.json).toHaveBeenCalledWith(["item1", "item2"]);
        }));
        test("Should catch errors and return 500", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.find.mockImplementationOnce(() => { throw new Error("DB Error"); });
            yield controller.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error retrieving data");
        }));
    });
    describe("getById", () => {
        test("Should return item if found", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.findById.mockResolvedValueOnce({ name: "Test Item" });
            yield controller.getById(req, res);
            expect(res.json).toHaveBeenCalledWith({ name: "Test Item" });
        }));
        test("Should return 404 if item is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.findById.mockResolvedValueOnce(null);
            yield controller.getById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith("Item not found");
        }));
        test("Should catch errors and return 500", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.findById.mockRejectedValueOnce(new Error("DB Error"));
            yield controller.getById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error retrieving item by ID");
        }));
    });
    describe("create", () => {
        test("Should create item and return 201", () => __awaiter(void 0, void 0, void 0, function* () {
            req.body = { name: "New Item" };
            mockModel.create.mockResolvedValueOnce({ id: "123", name: "New Item" });
            yield controller.create(req, res);
            expect(mockModel.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: "123", name: "New Item" });
        }));
        test("Should catch errors and return 500", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.create.mockRejectedValueOnce(new Error("DB Error"));
            yield controller.create(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error creating item");
        }));
    });
    describe("del", () => {
        test("Should delete item and return 200", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.findByIdAndDelete.mockResolvedValueOnce({ id: "123", deleted: true });
            yield controller.del(req, res);
            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: "123", deleted: true });
        }));
        test("Should catch errors and return 500", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.findByIdAndDelete.mockRejectedValueOnce(new Error("DB Error"));
            yield controller.del(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error deleting item");
        }));
    });
    describe("update", () => {
        test("Should update item and return updated data", () => __awaiter(void 0, void 0, void 0, function* () {
            req.body = { name: "Updated Name" };
            mockModel.findByIdAndUpdate.mockResolvedValueOnce({ id: "123", name: "Updated Name" });
            yield controller.update(req, res);
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, { new: true });
            expect(res.json).toHaveBeenCalledWith({ id: "123", name: "Updated Name" });
        }));
        test("Should catch errors and return 500", () => __awaiter(void 0, void 0, void 0, function* () {
            mockModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("DB Error"));
            yield controller.update(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error updating item");
        }));
    });
});
//# sourceMappingURL=base.test.js.map