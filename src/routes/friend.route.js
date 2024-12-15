import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  getAllFriends,
  deleteFriend,
  isFriend,
} from "../controllers/friend.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getAllFriends);

router.route("/:username/delete").delete(verifyJWT, deleteFriend);

router.route("/:username").get(verifyJWT, isFriend);

export default router;