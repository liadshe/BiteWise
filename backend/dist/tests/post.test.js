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
jest.setTimeout(30000);
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
            const response = yield (0, supertest_1.default)(app)
                .post("/post")
                .set("Authorization", "Bearer " + loginUser.token)
                .field("title", post.title)
                .field("description", post.description)
                .field("cuisine", post.cuisine)
                .field("nutrition", JSON.stringify(post.nutrition))
                .attach("image", Buffer.from("dummy image data"), "test.jpg");
            post._id = response.body._id;
            post.owner = loginUser._id;
            expect(response.status).toBe(201);
            expect(response.body.title).toBe(post.title);
            expect(response.body.description).toBe(post.description);
            expect(response.body.cuisine).toBe(post.cuisine);
            expect(response.body.imgUrl).toMatch(/^uploads[\\/]/);
            expect(response.body.owner).toBe(loginUser._id);
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
        expect(response.body[0].title).toBe(testUtils_1.postsList[0].title);
    }));
    test("Get Post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/post/" + testUtils_1.postsList[0]._id);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(testUtils_1.postsList[0].title);
        expect(response.body.description).toBe(testUtils_1.postsList[0].description);
        expect(response.body.cuisine).toBe(testUtils_1.postsList[0].cuisine);
    }));
    test("Update Post", () => __awaiter(void 0, void 0, void 0, function* () {
        testUtils_1.postsList[0].title = "Updated Post Title";
        testUtils_1.postsList[0].description = "Updated description for the post";
        const response = yield (0, supertest_1.default)(app)
            .put("/post/" + testUtils_1.postsList[0]._id)
            .set("Authorization", "Bearer " + loginUser.token)
            .field("title", testUtils_1.postsList[0].title)
            .field("description", testUtils_1.postsList[0].description)
            .field("cuisine", testUtils_1.postsList[0].cuisine)
            .field("nutrition", JSON.stringify(testUtils_1.postsList[0].nutrition));
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(testUtils_1.postsList[0].title);
        expect(response.body.description).toBe(testUtils_1.postsList[0].description);
        const maliciousResponse = yield (0, supertest_1.default)(app)
            .put("/post/" + testUtils_1.postsList[0]._id)
            .set("Authorization", "Bearer " + loginUser.token)
            .field("title", "Hack attempt")
            .field("owner", "507f1f77bcf86cd799439044");
        expect(maliciousResponse.status).toBe(200);
        expect(maliciousResponse.body.owner).not.toBe("507f1f77bcf86cd799439044");
    }));
    // Moved Toggle Like up here, BEFORE the post gets deleted!
    test("Toggle Like on a Post", () => __awaiter(void 0, void 0, void 0, function* () {
        const likeRes = yield (0, supertest_1.default)(app)
            .post("/post/" + testUtils_1.postsList[0]._id + "/like")
            .set("Authorization", "Bearer " + loginUser.token);
        expect(likeRes.status).toBe(200);
        expect(likeRes.body.likes).toContain(loginUser._id);
        const unlikeRes = yield (0, supertest_1.default)(app)
            .post("/post/" + testUtils_1.postsList[0]._id + "/like")
            .set("Authorization", "Bearer " + loginUser.token);
        expect(unlikeRes.status).toBe(200);
        expect(unlikeRes.body.likes).not.toContain(loginUser._id);
    }));
    // Delete Post is now the final test in the suite
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