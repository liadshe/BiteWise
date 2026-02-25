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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const postModel_1 = __importDefault(require("../models/postModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const testUtils_1 = require("./testUtils");
const mongoose_1 = __importDefault(require("mongoose"));
jest.setTimeout(30000); // Set timeout to 30 seconds for all tests in this suite
let app;
let loginUser;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield postModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    loginUser = yield (0, testUtils_1.getLoggedInUser)(app);
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Post Tests Suite", () => {
    test("Initial empty posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("Create Post", () => __awaiter(void 0, void 0, void 0, function* () {
        for (const post of testUtils_1.postsList) {
            const response = yield (0, supertest_1.default)(app).post("/post")
                .set("Authorization", "Bearer " + loginUser.token)
                .send(post);
            post._id = response.body._id; // Store the created post ID for later tests
            post.owner = loginUser._id; // Store the owner ID for later tests
            expect(response.status).toBe(201);
            // Changed from content to title, description, and cuisine
            expect(response.body.title).toBe(post.title);
            expect(response.body.description).toBe(post.description);
            expect(response.body.cuisine).toBe(post.cuisine);
            expect(response.body.owner._id).toBe(loginUser._id);
            expect(response.body.imgUrl).toBe(post.imgUrl);
            expect(response.body.likes).toEqual(post.likes);
            expect(response.body.nutrition).toEqual(post.nutrition);
        }
    }));
    test("Get All Posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(testUtils_1.postsList.length);
    }));
    test("Get Posts by logged in user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post?owner=" + loginUser._id);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(testUtils_1.postsList.length);
        // Changed to test title instead of content
        expect(response.body[0].title).toBe(testUtils_1.postsList[0].title);
    }));
    // get post by id
    test("Get Post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/" + testUtils_1.postsList[0]._id);
        expect(response.status).toBe(200);
        // Changed from content to title, description, and cuisine
        expect(response.body.title).toBe(testUtils_1.postsList[0].title);
        expect(response.body.description).toBe(testUtils_1.postsList[0].description);
        expect(response.body.cuisine).toBe(testUtils_1.postsList[0].cuisine);
        expect(response.body.owner).toBe(testUtils_1.postsList[0].owner);
        expect(response.body.imgUrl).toBe(testUtils_1.postsList[0].imgUrl);
        expect(response.body.likes).toEqual(testUtils_1.postsList[0].likes);
        expect(response.body.nutrition).toEqual(testUtils_1.postsList[0].nutrition);
    }));
    // update post
    test("Update Post", () => __awaiter(void 0, void 0, void 0, function* () {
        // Changing the fields for the update test
        testUtils_1.postsList[0].title = "Updated Post Title";
        testUtils_1.postsList[0].description = "Updated description for the post";
        const response = yield (0, supertest_1.default)(app)
            .put("/post/" + testUtils_1.postsList[0]._id)
            .set("Authorization", "Bearer " + loginUser.token)
            .send(testUtils_1.postsList[0]);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(testUtils_1.postsList[0].title);
        expect(response.body.description).toBe(testUtils_1.postsList[0].description);
        // Verify that the owner cannot be changed
        testUtils_1.postsList[0].owner = "507f1f77bcf86cd799439044";
        const response2 = yield (0, supertest_1.default)(app)
            .put("/post/" + testUtils_1.postsList[0]._id)
            .set("Authorization", "Bearer " + loginUser.token)
            .send(testUtils_1.postsList[0]);
        expect(response2.status).toBe(400);
    }));
    test("Delete Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/post/" + testUtils_1.postsList[0]._id)
            .set("Authorization", "Bearer " + loginUser.token);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(testUtils_1.postsList[0]._id);
        const getResponse = yield (0, supertest_1.default)(app).get("/post/" + testUtils_1.postsList[0]._id);
        expect(getResponse.status).toBe(404);
    }));
});
//# sourceMappingURL=post.test.js.map