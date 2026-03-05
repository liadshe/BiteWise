"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.dev' });
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const commentRoute_1 = __importDefault(require("./routes/commentRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use("/auth", authRoute_1.default);
app.use("/post", postRoute_1.default);
app.use("/comment", commentRoute_1.default);
app.use("/user", userRoute_1.default);
const initApp = () => {
    const pr = new Promise((resolve, reject) => {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            reject("DATABASE_URL is not defined");
            return;
        }
        mongoose_1.default.connect(dbUrl, {})
            .then(() => {
            resolve(app);
        });
        const db = mongoose_1.default.connection;
        db.on("error", (error) => console.error(error));
        db.once("open", () => console.log("Connected to Database"));
    });
    return pr;
};
exports.default = initApp;
//# sourceMappingURL=index.js.map