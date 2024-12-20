import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  getAllFriends,
  deleteFriend,
  isFriend,
} from "../controllers/friend.controller.js";

const router = Router();

router.route("/").post(verifyJWT, getAllFriends);

router.route("/:username/delete").post(verifyJWT, deleteFriend);

router.route("/:username").post(verifyJWT, isFriend);

export default router;