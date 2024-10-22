import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json({ limit: "5mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import requestRouter from "./routes/request.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/friendRequests", requestRouter);

export { app };
