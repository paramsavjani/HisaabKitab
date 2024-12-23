import { Preferences } from "@capacitor/preferences";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL, {
  auth: async (cb) => {
    cb({
      accessToken: (await Preferences.get({ key: "accessToken" })).value,
    });
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;