import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addTransaction,
  showTransactions,
  acceptTransaction,
  denyTransaction,
  cancelTransaction,
  getActiveFriends,
} from "../controllers/transaction.controller.js";

const router = Router();

router.route("/").post(verifyJWT, getActiveFriends);

router.route("/:username/add").post(verifyJWT, addTransaction);

router.route("/:username").post(verifyJWT, showTransactions);

router.route("/:transactioinId/accept").post(verifyJWT, acceptTransaction);

router.route("/:transactioinId/deny").post(verifyJWT, denyTransaction);

router.route("/:transactioinId/cancel").post(verifyJWT, cancelTransaction);

export default router;
