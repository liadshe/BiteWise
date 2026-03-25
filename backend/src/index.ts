import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: '.env.dev'});
import cors from "cors";
import path from "path";

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./swagger";


import authRoute from "./routes/authRoute";
import postRoute from "./routes/postRoute";
import commentRoute from "./routes/commentRoute";
import userRoute from "./routes/userRoute";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/auth", authRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);
app.use("/user", userRoute);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      #swagger-ui > .swagger-ui:first-child:before {
    content: "";
    display: block;
    margin: 12px auto;
    width: 80px;               
    height: 80px;              
    background-image: url('/uploads/noaLiadAv.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
    `,
  })
);

const initApp = () => {
  const pr = new Promise<Express>((resolve, reject) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      reject("DATABASE_URL is not defined");
      return;
    }
    mongoose.connect(dbUrl, {})
    .then(() => {
      resolve(app)}
    );
  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to Database"));
  
});
  return pr;
}

export default initApp;