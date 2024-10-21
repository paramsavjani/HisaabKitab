import { Router } from "express";
import { sendRequest } from "../controllers/request.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:username/send").post(verifyJWT, sendRequest);


export default router;
