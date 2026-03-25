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
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const testUtils_1 = require("./testUtils");
const baseController_1 = __importDefault(require("../controllers/baseController"));
let app;
let user1;
let user2;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, index_1.default)();
    yield userModel_1.default.deleteMany();
    // Create User 1 using our utility
    user1 = yield (0, testUtils_1.getLoggedInUser)(app);
    // Register User 2 manually so we have two distinct accounts for the 403 test
    const res = yield (0, supertest_1.default)(app).post("/auth/register").send(testUtils_1.secondUserData);
    user2 = Object.assign(Object.assign({}, testUtils_1.secondUserData), { _id: res.body._id, token: res.body.token });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("User Controller Tests", () => {
    describe("GET /user/:id - Get User by ID", () => {
        test("Should get a user by their ID successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/user/" + user1._id);
            expect(response.status).toBe(200);
            expect(response.body.username).toBe(user1.username);
            expect(response.body.email).toBe(user1.email);
        }));
        test("Should return 404 for a valid format but non-existent ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            const response = yield (0, supertest_1.default)(app).get("/user/" + fakeId);
            expect(response.status).toBe(404);
        }));
    });
    describe("PUT /user/:id - Update User Profile", () => {
        test("Should block User 2 from updating User 1's profile (403 Forbidden)", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put("/user/" + user1._id)
                .set("Authorization", "Bearer " + user2.token) // User 2's token
                .send({ username: "hacked_username" });
            expect(response.status).toBe(403);
            expect(response.text).toBe("Forbidden: You can only update your own profile");
        }));
        test("Should allow User 1 to update their profile WITHOUT an image", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put("/user/" + user1._id)
                .set("Authorization", "Bearer " + user1.token)
                .send({ username: "updated_username_no_img" });
            expect(response.status).toBe(200);
            // Fetch the user to verify the change was saved
            const getResponse = yield (0, supertest_1.default)(app).get("/user/" + user1._id);
            expect(getResponse.body.username).toBe("updated_username_no_img");
        }));
        test("Should allow User 1 to update their profile WITH an image via Multer", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put("/user/" + user1._id)
                .set("Authorization", "Bearer " + user1.token)
                .field("username", "username_with_image")
                // Mimic form-data file upload to trigger the req.file branch in your controller
                .attach("image", Buffer.from("dummy profile picture data"), "profile.jpg");
            expect(response.status).toBe(200);
            // Fetch the user to verify the image URL was saved and backslashes were replaced
            const getResponse = yield (0, supertest_1.default)(app).get("/user/" + user1._id);
            expect(getResponse.body.username).toBe("username_with_image");
            expect(getResponse.body.imgUrl).toMatch(/^uploads\//); // Should start with uploads/
        }));
        test("Should hit the catch block and return 500 on unexpected errors", () => __awaiter(void 0, void 0, void 0, function* () {
            // To guarantee we hit the outer catch block in UserController (and not the inner one in baseController),
            // we temporarily spy on and override the parent baseController.update method to force a failure.
            const updateSpy = jest.spyOn(baseController_1.default.prototype, 'update').mockImplementationOnce(() => {
                throw new Error("Simulated Server Crash");
            });
            const response = yield (0, supertest_1.default)(app)
                .put("/user/" + user1._id)
                .set("Authorization", "Bearer " + user1.token)
                .send({ username: "fail_me" });
            expect(response.status).toBe(500);
            expect(response.text).toBe("Error updating user");
            // Restore the method so we don't break other tests
            updateSpy.mockRestore();
        }));
    });
});
//# sourceMappingURL=user.test.js.map