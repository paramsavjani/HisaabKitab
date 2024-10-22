import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {addTransaction} from "../controllers/transaction.controller.js";

const router = Router();


router.route("/:username/add").post(verifyJWT, addTransaction);



export default router;