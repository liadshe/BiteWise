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
const userModel_1 = __importDefault(require("../models/userModel"));
const testUtils_1 = require("./testUtils");
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.TOKEN_EXPIRATION = "1"; // Token expires in 1 second
    app = yield (0, index_1.default)();
    yield userModel_1.default.deleteMany();
}));
afterAll((done) => {
    done();
});
describe("Test Auth Suite", () => {
    test("Test post a post without token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const postDataItem = testUtils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app).post("/post").send(postDataItem);
        expect(response.status).toBe(401);
    }));
    test("Test Registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = testUtils_1.userData.email;
        const password = testUtils_1.userData.password;
        const username = testUtils_1.userData.username;
        const response = yield (0, supertest_1.default)(app).post("/auth/register").send({ "email": email, "password": password, "username": username });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
        testUtils_1.userData.token = response.body.token;
        testUtils_1.userData._id = response.body._id;
        //check refresh token
        expect(response.body).toHaveProperty("refreshToken");
        testUtils_1.userData.refreshToken = response.body.refreshToken;
    }));
    test("create a post with token succeeds", () => __awaiter(void 0, void 0, void 0, function* () {
        const postDataItem = testUtils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(postDataItem);
        expect(response.status).toBe(201);
    }));
    test("create a post with comporomised token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const postDataItem = testUtils_1.postsList[0];
        const compromizedToken = testUtils_1.userData.token + "a";
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + compromizedToken)
            .send(postDataItem);
        expect(response.status).toBe(401);
    }));
    test("Test Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = testUtils_1.userData.email;
        const password = testUtils_1.userData.password;
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send({ "email": email, "password": password });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("refreshToken");
        testUtils_1.userData.token = response.body.token;
        testUtils_1.userData.refreshToken = response.body.refreshToken;
    }));
    jest.setTimeout(10000);
    test("Test using token after expiration fails", () => __awaiter(void 0, void 0, void 0, function* () {
        //sleep for 5 seconds to let the token expire
        yield new Promise((r) => setTimeout(r, 5000));
        const postDataItem = testUtils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(postDataItem);
        expect(response.status).toBe(401);
        //refresh the token
        const refreshResponse = yield (0, supertest_1.default)(app).post("/auth/refresh").send({ "refreshToken": testUtils_1.userData.refreshToken });
        console.log("Refresh response body:", refreshResponse.body);
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body).toHaveProperty("token");
        testUtils_1.userData.token = refreshResponse.body.token;
        testUtils_1.userData.refreshToken = refreshResponse.body.refreshToken;
        //try to create movie again
        const retryResponse = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            .send(postDataItem);
        expect(retryResponse.status).toBe(201);
    }));
    //test double use of refresh token fails
    test("Test double use of refresh token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        //use the current refresh token to get a new token
        const refreshResponse1 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({ "refreshToken": testUtils_1.userData.refreshToken });
        expect(refreshResponse1.status).toBe(200);
        expect(refreshResponse1.body).toHaveProperty("token");
        const newRefreshToken = refreshResponse1.body.refreshToken;
        //try to use the same refresh token again
        const refreshResponse2 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({ "refreshToken": testUtils_1.userData.refreshToken });
        expect(refreshResponse2.status).toBe(401);
        //try to use the new refresh token also fails
        const refreshResponse3 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({ "refreshToken": newRefreshToken });
        expect(refreshResponse3.status).toBe(401);
    }));
});
//# sourceMappingURL=auth.test.js.map