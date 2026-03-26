import initApp from "./index";
import https from "https";
import http from "http";
import fs from "fs";
const port = process.env.PORT || 3000;

initApp()
    .then((app) => {
        if (process.env.NODE_ENV === "production") {
            const privateKey = fs.readFileSync("client-key.pem", "utf8");
            const certificate = fs.readFileSync("client-cert.pem", "utf8");
            const credentials = { key: privateKey, cert: certificate };

            // Create the HTTPS server
            const httpsServer = https.createServer(credentials, app);
            
            httpsServer.listen(port, () => {
                console.log(`Production HTTPS Server running at https://localhost:${port}`);
                console.log(`Swagger docs available at https://localhost:${port}/api-docs`);
            });
        } else {
            // standard HTTP for development
            const httpServer = http.createServer(app);
            
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