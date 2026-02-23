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
const commentModel_1 = __importDefault(require("../models/commentModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
const testUtils_1 = require("./testUtils");
const mongoose_1 = __importDefault(require("mongoose"));
let app;
let users; // user 1 with post and user 2 without post
jest.setTimeout(30000); // Set timeout to 30 seconds for all tests in this suite
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield commentModel_1.default.deleteMany();
    yield postModel_1.default.deleteMany();
    yield userModel_1.default.deleteMany();
    users = yield (0, testUtils_1.createUser1WithPostandUser2)(app);
}));
afterAll(() => {
    mongoose_1.default.connection.close();
});
describe("Comment Tests Suite", () => {
    test("Initial empty comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }));
    test("Create Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // get post id from user 1s post
        const postResponse = yield (0, supertest_1.default)(app).get("/post?owner=" + users[0]._id);
        expect(postResponse.status).toBe(200);
        expect(postResponse.body.length).toBe(1);
        const postId = postResponse.body[0]._id;
        // create comment for user 1s post from user 2
        let commentData = Object.assign(Object.assign({}, testUtils_1.commentsList[0]), { postId });
        const response = yield (0, supertest_1.default)(app).post("/comment")
            .set("Authorization", "Bearer " + users[1].token)
            .send(commentData);
        expect(response.status).toBe(201);
        expect(response.body.content).toBe(commentData.content);
        expect(response.body.owner).toBe(users[1]._id);
        expect(response.body.postId).toBe(postId);
        // create comment for user 1s post from user 1
        commentData = Object.assign(Object.assign({}, testUtils_1.commentsList[1]), { postId });
        const response2 = yield (0, supertest_1.default)(app).post("/comment")
            .set("Authorization", "Bearer " + users[0].token)
            .send(commentData);
        expect(response2.status).toBe(201);
        expect(response2.body.content).toBe(commentData.content);
        expect(response2.body.owner).toBe(users[0]._id);
        expect(response2.body.postId).toBe(postId);
    }));
    test("Get All Comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comment");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    }));
    test("Get Comments by postId", () => __awaiter(void 0, void 0, void 0, function* () {
        // get post id from user 1s post
        const postResponse = yield (0, supertest_1.default)(app).get("/post?owner=" + users[0]._id);
        expect(postResponse.status).toBe(200);
        expect(postResponse.body.length).toBe(1);
        const postId = postResponse.body[0]._id;
        const response = yield (0, supertest_1.default)(app).get("/comment?postId=" + postId);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    }));
    test("Get Comment by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        // get comment id from user 2s comment
        const commentsResponse = yield (0, supertest_1.default)(app).get("/comment?owner=" + users[1]._id);
        expect(commentsResponse.status).toBe(200);
        expect(commentsResponse.body.length).toBe(1);
        const commentId = commentsResponse.body[0]._id;
        const response = yield (0, supertest_1.default)(app).get("/comment/" + commentId);
        expect(response.status).toBe(200);
        expect(response.body.content).toBe(testUtils_1.commentsList[0].content);
        expect(response.body.owner).toBe(users[1]._id);
    }));
    test("Update Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // get comment id from user 2s comment
        const commentsResponse = yield (0, supertest_1.default)(app).get("/comment?owner=" + users[1]._id);
        expect(commentsResponse.status).toBe(200);
        expect(commentsResponse.body.length).toBe(1);
        const commentId = commentsResponse.body[0]._id;
        // try to update from user 1 - should fail
        let response = yield (0, supertest_1.default)(app).put("/comment/" + commentId)
            .set("Authorization", "Bearer " + users[0].token)
            .send({ content: "Updated Comment Content" });
        expect(response.status).toBe(403);
        // try to update owner's field - should fail
        response = yield (0, supertest_1.default)(app).put("/comment/" + commentId)
            .set("Authorization", "Bearer " + users[1].token)
            .send({ owner: users[0]._id });
        expect(response.status).toBe(400);
        // try to update from user 2 - should succeed
        response = yield (0, supertest_1.default)(app).put("/comment/" + commentId)
            .set("Authorization", "Bearer " + users[1].token)
            .send({ content: "Updated Comment Content" });
        expect(response.status).toBe(200);
        expect(response.body.content).toBe("Updated Comment Content");
    }));
    test("Delete Comment", () => __awaiter(void 0, void 0, void 0, function* () {
        // get comment id from user 2s comment
        const commentsResponse = yield (0, supertest_1.default)(app).get("/comment?owner=" + users[1]._id);
        expect(commentsResponse.status).toBe(200);
        expect(commentsResponse.body.length).toBe(1);
        const commentId = commentsResponse.body[0]._id;
        // try to delete from user 1 - should fail
        let response = yield (0, supertest_1.default)(app).delete("/comment/" + commentId)
            .set("Authorization", "Bearer " + users[0].token);
        expect(response.status).toBe(403);
        // try to delete from user 2 - should succeed
        response = yield (0, supertest_1.default)(app).delete("/comment/" + commentId)
            .set("Authorization", "Bearer " + users[1].token);
        expect(response.status).toBe(200);
    }));
});
//# sourceMappingURL=comment.test.js.map