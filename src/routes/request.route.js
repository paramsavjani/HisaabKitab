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

router.route("/receivedAll").get(verifyJWT, receivedAll);

router.route("/:requestId/accept").post(verifyJWT, acceptRequest);

router.route("/:requestId/deny").post(verifyJWT, denyRequest);

router.route("/sendAll").get(verifyJWT, sendAll);

router.route("/:requestId/cancel").delete(verifyJWT, cancelRequest);

router.route("/:username/alreadyRequested").get(verifyJWT, alreadyRequested);

export default router;
