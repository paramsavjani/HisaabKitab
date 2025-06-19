import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUser,
  searchUser,
  userInfo,
  fcmtoken,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("profilePicture"), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/verify").post(verifyJWT, getUser);

router.route("/search").get(searchUser);

router.route("/get/:username").post(userInfo);

router.route("/fcm").post(verifyJWT, fcmtoken);

export default router;
