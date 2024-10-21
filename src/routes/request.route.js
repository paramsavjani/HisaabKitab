import { Router } from "express";
import { sendRequest, allRequests,acceptRequest } from "../controllers/request.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:username/send").post(verifyJWT, sendRequest);

router.route("/all").get(verifyJWT, allRequests);

router.route("/:requestId/accept").post(verifyJWT, acceptRequest);

export default router;
