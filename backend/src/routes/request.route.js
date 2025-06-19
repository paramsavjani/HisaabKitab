import { Router } from "express";
import {
  sendRequest,
  receivedAll,
  acceptRequest,
  denyRequest,
  sendAll,
  cancelRequest,
  alreadyRequested,
} from "../controllers/request.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:username/send").post(verifyJWT, sendRequest);

router.route("/receivedAll").post(verifyJWT, receivedAll);

router.route("/:requestId/accept").post(verifyJWT, acceptRequest);

router.route("/:requestId/deny").post(verifyJWT, denyRequest);

router.route("/sendAll").post(verifyJWT, sendAll);

router.route("/:requestId/cancel").post(verifyJWT, cancelRequest);

router.route("/:username/alreadyRequested").post(verifyJWT, alreadyRequested);

export default router;
