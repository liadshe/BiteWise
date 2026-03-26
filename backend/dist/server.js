"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const port = process.env.PORT || 3000;
(0, index_1.default)()
    .then((app) => {
    if (process.env.NODE_ENV === "production") {
        const privateKey = fs_1.default.readFileSync("client-key.pem", "utf8");
        const certificate = fs_1.default.readFileSync("client-cert.pem", "utf8");
        const credentials = { key: privateKey, cert: certificate };
        // Create the HTTPS server
        const httpsServer = https_1.default.createServer(credentials, app);
        httpsServer.listen(port, () => {
            console.log(`Production HTTPS Server running at https://localhost:${port}`);
            console.log(`Swagger docs available at https://localhost:${port}/api-docs`);
        });
    }
    else {
        // standard HTTP for development
        const httpServer = http_1.default.createServer(app);
        httpServer.listen(port, () => {
            console.log(`Development HTTP Server running at http://localhost:${port}`);
            console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
        });
    }
})
    .catch((err) => {
    console.error("Failed to initialize app:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map