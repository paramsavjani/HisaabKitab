import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getAllFriends } from "../controllers/friend.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getAllFriends);



export default router;
