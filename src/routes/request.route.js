import { Router } from "express";
import { sendRequest, allRequests } from "../controllers/request.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:username/send").post(verifyJWT, sendRequest);

router.route("/all").get(verifyJWT, allRequests);

export default router;
