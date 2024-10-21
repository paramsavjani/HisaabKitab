import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(upload.single("profilePicture"), registerUser);

userRouter.route("/login").post(loginUser);

export { userRouter };
