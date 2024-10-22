import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  getAllFriends,
  deleteFriend,
  showTransactions,
} from "../controllers/friend.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getAllFriends);

// todo: modify the delete function, if the user will have take loan from the friend, then it will not be deleted
router.route("/:username/delete").delete(verifyJWT, deleteFriend);

router.route("/:username/transactions").get(verifyJWT, showTransactions);

export default router;
