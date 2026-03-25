import swaggerJsDoc from 'swagger-jsdoc';
import path from 'path';

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
    apis: [path.join(__dirname, "./routes/*.{ts,js}")],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;