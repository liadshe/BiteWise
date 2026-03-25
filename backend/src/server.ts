import initApp from "./index";

const port = process.env.PORT || 3000;

initApp()
    .then((app) => {
        app.listen(port, () => {
            console.log(`Posts app listening at http://localhost:${port}`);
            console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize app:", err);
        process.exit(1);
    });