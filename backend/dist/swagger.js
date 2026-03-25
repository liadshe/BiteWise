"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BiteWise API',
            version: '1.0.0',
            description: 'API Documentation for the BiteWise Project',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // הנתיב שסידרנו קודם שעובד לך:
    apis: [path_1.default.join(__dirname, "./routes/*.{ts,js}")],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerDocs;
//# sourceMappingURL=swagger.js.map