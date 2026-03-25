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
const mongoose_1 = __importDefault(require("mongoose")); // Imported mongoose to close connections
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => {
            return {
                verifyIdToken: jest.fn().mockRejectedValue(new Error("Mocked Invalid Google Token")),
            };
        }),
    };
});
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.TOKEN_EXPIRATION = "1"; // Token expires in 1 second
    app = yield (0, index_1.default)();
    yield userModel_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Close the mongoose connection to resolve open handle warnings
    yield mongoose_1.default.connection.close();
}));
describe("Test Auth Suite", () => {
    test("Test post a post without token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const postDataItem = testUtils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            // Send as form-data even though it fails early, just for consistency
            .field("title", postDataItem.title)
            .field("description", postDataItem.description)
            .field("cuisine", postDataItem.cuisine)
            .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
            .attach("image", Buffer.from("dummy image data"), "test.jpg");
        expect(response.status).toBe(401);
    }));
    test("Test Registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = testUtils_1.userData.email;
        const password = testUtils_1.userData.password;
        const username = testUtils_1.userData.username;
        // Auth routes use JSON, so .send() is fine here
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
        // Grab a fresh token in case the previous one took >1s and expired
        const loginRes = yield (0, supertest_1.default)(app).post("/auth/login").send({
            email: testUtils_1.userData.email,
            password: testUtils_1.userData.password
        });
        const freshToken = loginRes.body.token;
        const postDataItem = testUtils_1.postsList[0];
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + freshToken)
            .field("title", postDataItem.title)
            .field("description", postDataItem.description)
            .field("cuisine", postDataItem.cuisine)
            .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
            .attach("image", Buffer.from("dummy image data"), "test.jpg");
        expect(response.status).toBe(201);
    }));
    test("create a post with comporomised token fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const postDataItem = testUtils_1.postsList[0];
        const compromizedToken = testUtils_1.userData.token + "a";
        const response = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + compromizedToken)
            .field("title", postDataItem.title)
            .field("description", postDataItem.description)
            .field("cuisine", postDataItem.cuisine)
            .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
            .attach("image", Buffer.from("dummy image data"), "test.jpg");
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
            .field("title", postDataItem.title)
            .field("description", postDataItem.description)
            .field("cuisine", postDataItem.cuisine)
            .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
            .attach("image", Buffer.from("dummy image data"), "test.jpg");
        expect(response.status).toBe(401);
        //refresh the token
        const refreshResponse = yield (0, supertest_1.default)(app).post("/auth/refresh").send({ "refreshToken": testUtils_1.userData.refreshToken });
        console.log("Refresh response body:", refreshResponse.body);
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body).toHaveProperty("token");
        testUtils_1.userData.token = refreshResponse.body.token;
        testUtils_1.userData.refreshToken = refreshResponse.body.refreshToken;
        //try to create post again with new token
        const retryResponse = yield (0, supertest_1.default)(app)
            .post("/post")
            .set("Authorization", "Bearer " + testUtils_1.userData.token)
            // FIX: Use form-data fields for the retry as well
            .field("title", postDataItem.title)
            .field("description", postDataItem.description)
            .field("cuisine", postDataItem.cuisine)
            .field("nutrition", JSON.stringify(postDataItem.nutrition || {}))
            .attach("image", Buffer.from("dummy image data"), "test.jpg");
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
    test("Login with wrong password should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send({ "email": testUtils_1.userData.email, "password": "wrong_password_123" });
        // Depending on your controller, this might be 400 or 401
        expect(response.status).not.toBe(200);
    }));
    test("Login with non-existent email should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send({ "email": "nobody@nowhere.com", "password": "password" });
        expect(response.status).not.toBe(200);
    }));
    test("Register with missing fields should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/register").send({ "email": "onlyemail@test.com" } // Missing password and username
        );
        expect(response.status).not.toBe(201);
    }));
    test("Google Login with invalid token should fail gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/google").send({ credential: "fake_google_token" });
        // It should fail to verify with Google and catch the error
        expect(response.status).toBe(400); // Or 500 depending on your catch block
    }));
    test("Auth endpoints catch 500 errors", () => __awaiter(void 0, void 0, void 0, function* () {
        // Force the DB to crash to test the catch(err) block in login
        const spy = jest.spyOn(userModel_1.default, 'findOne').mockRejectedValueOnce(new Error("DB Crash"));
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send({ "email": testUtils_1.userData.email, "password": testUtils_1.userData.password });
        expect(response.status).toBe(500);
        spy.mockRestore();
    }));
});
//# sourceMappingURL=auth.test.js.map