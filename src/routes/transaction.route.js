import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addTransaction,
  showTransactions,
  acceptTransaction,
  denyTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.route("/:username/add").post(verifyJWT, addTransaction);

router.route("/:username").get(verifyJWT, showTransactions);

router.route("/:transactioinId/accept").post(verifyJWT, acceptTransaction);

router.route("/:transactioinId/deny").post(verifyJWT, denyTransaction);

export default router;