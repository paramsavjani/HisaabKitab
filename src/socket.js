import { Preferences } from "@capacitor/preferences";
import { io } from "socket.io-client";

const socket = io(`wss://${process.env.REACT_APP_BACKEND_URL.split("//")[1]}`, {
  auth: async (cb) => {
    cb({
      accessToken: (await Preferences.get({ key: "accessToken" })).value,
    });
  },
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
