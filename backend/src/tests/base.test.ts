import BaseController from "../controllers/baseController";
import { Request, Response } from "express";

// 1. Create a fully mocked Mongoose model to pass into the BaseController
const mockQuery = Promise.resolve(["item1", "item2"]) as any;
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
class TestController extends BaseController {
    constructor() {
        super(mockModel);
    }
}
const controller = new TestController();

describe("Base Controller Unit Tests", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

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
        test("Should return data without pagination", async () => {
            await controller.getAll(req as Request, res as Response);
            expect(mockModel.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(["item1", "item2"]);
        });

        test("Should handle pagination when page query is provided", async () => {
            req.query = { page: "2", limit: "5" };
            await controller.getAll(req as Request, res as Response);
            
            expect(mockQuery.skip).toHaveBeenCalledWith(5); // (page 2 - 1) * 5
            expect(mockQuery.limit).toHaveBeenCalledWith(5);
            expect(res.json).toHaveBeenCalledWith(["item1", "item2"]);
        });

        test("Should catch errors and return 500", async () => {
            mockModel.find.mockImplementationOnce(() => { throw new Error("DB Error"); });
            await controller.getAll(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error retrieving data");
        });
    });

    describe("getById", () => {
        test("Should return item if found", async () => {
            mockModel.findById.mockResolvedValueOnce({ name: "Test Item" });
            await controller.getById(req as Request, res as Response);
            expect(res.json).toHaveBeenCalledWith({ name: "Test Item" });
        });

        test("Should return 404 if item is not found", async () => {
            mockModel.findById.mockResolvedValueOnce(null);
            await controller.getById(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith("Item not found");
        });

        test("Should catch errors and return 500", async () => {
            mockModel.findById.mockRejectedValueOnce(new Error("DB Error"));
            await controller.getById(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error retrieving item by ID");
        });
    });

    describe("create", () => {
        test("Should create item and return 201", async () => {
            req.body = { name: "New Item" };
            mockModel.create.mockResolvedValueOnce({ id: "123", name: "New Item" });
            
            await controller.create(req as Request, res as Response);
            
            expect(mockModel.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: "123", name: "New Item" });
        });

        test("Should catch errors and return 500", async () => {
            mockModel.create.mockRejectedValueOnce(new Error("DB Error"));
            await controller.create(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error creating item");
        });
    });

    describe("del", () => {
        test("Should delete item and return 200", async () => {
            mockModel.findByIdAndDelete.mockResolvedValueOnce({ id: "123", deleted: true });
            await controller.del(req as Request, res as Response);
            
            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: "123", deleted: true });
        });

        test("Should catch errors and return 500", async () => {
            mockModel.findByIdAndDelete.mockRejectedValueOnce(new Error("DB Error"));
            await controller.del(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error deleting item");
        });
    });

    describe("update", () => {
        test("Should update item and return updated data", async () => {
            req.body = { name: "Updated Name" };
            mockModel.findByIdAndUpdate.mockResolvedValueOnce({ id: "123", name: "Updated Name" });
            
            await controller.update(req as Request, res as Response);
            
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, { new: true });
            expect(res.json).toHaveBeenCalledWith({ id: "123", name: "Updated Name" });
        });

        test("Should catch errors and return 500", async () => {
            mockModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("DB Error"));
            await controller.update(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Error updating item");
        });
    });
});