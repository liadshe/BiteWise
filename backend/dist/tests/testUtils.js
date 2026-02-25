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
exports.commentsList = exports.createUser1WithPostandUser2 = exports.postsList = exports.getLoggedInUser = exports.secondUserData = exports.userData = void 0;
const supertest_1 = __importDefault(require("supertest"));
exports.userData = {
    email: "test@test.com",
    password: "testpass",
    username: "testuser",
    token: "",
    refreshToken: ""
};
exports.secondUserData = {
    email: "test2@test.com",
    password: "testpass2",
    username: "testuser2",
    token: "",
    refreshToken: ""
};
const getLoggedInUser = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = exports.userData;
    // try Register
    let response = yield (0, supertest_1.default)(app).post("/auth/register").send({ email, password, username });
    // if registration failed ,try Login
    if (response.status !== 201) {
        response = yield (0, supertest_1.default)(app).post("/auth/login").send({ email, password });
    }
    if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Failed to authenticate test user: ${response.text}`);
    }
    return {
        _id: response.body._id,
        token: response.body.token,
        refreshToken: response.body.refreshToken,
        email,
        password,
        username
    };
});
exports.getLoggedInUser = getLoggedInUser;
exports.postsList = [
    {
        content: "This is the content of test post 1",
        imgUrl: "public/images/recipe1.jpg",
        likes: [],
        nutrition: { calories: 100, protein: 20, suggestions: "Add more vegetables" }
    },
    {
        content: "This is the content of test post 2",
        imgUrl: "public/images/recipe2.jpg",
        likes: [],
        nutrition: { calories: 150, protein: 30, suggestions: "Add more protein" }
    }
];
// returns an array with two users, the first one has a post and the second one is just a regular user
const createUser1WithPostandUser2 = (app) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a user
    const users = [];
    const data = yield (0, exports.getLoggedInUser)(app);
    users[0] = data;
    // Create a post for the user
    const postResponse = yield (0, supertest_1.default)(app).post("/post").send(exports.postsList[0]).set("Authorization", "Bearer " + (yield data).token);
    if (postResponse.status !== 201) {
        throw new Error(`Failed to create post for test user: ${postResponse.text}`);
    }
    // register second user
    const secondUserResponse = yield (0, supertest_1.default)(app).post("/auth/register").send(exports.secondUserData);
    if (secondUserResponse.status !== 201) {
        throw new Error(`Failed to register second test user: ${secondUserResponse.text}`);
    }
    users[1] = secondUserResponse.body;
    return users;
});
exports.createUser1WithPostandUser2 = createUser1WithPostandUser2;
exports.commentsList = [
    { content: "this is my comment", postId: "507f1f77bcf86cd799439012" },
    { content: "this is my second comment", postId: "507f1f77bcf86cd799439014" },
    { content: "this is my third comment", postId: "507f1f77bcf86cd799439016" },
    { content: "this is my fourth comment", postId: "507f1f77bcf86cd799439018" },
];
//# sourceMappingURL=testUtils.js.map