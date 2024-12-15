import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUser,
  searchUser,
  userInfo,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = Router();


router.route("/register").post((req, res, next) => {
  upload.single("profilePicture")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error handling
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Other errors
      return res.status(500).json({ error: "File upload error" });
    }
    // Proceed to the controller if no upload errors
    next();
  });
}, registerUser);


router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/verify").get(verifyJWT, getUser);

router.route("/search").get(searchUser);

router.route("/get/:username").get(userInfo);

export default router;
