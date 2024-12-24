import { Preferences } from "@capacitor/preferences";
import { io } from "socket.io-client";
import { Capacitor } from "@capacitor/core";

const socket = io(
  Capacitor.getPlatform() === "web"
    ? process.env.REACT_APP_BACKEND_URL
    : `wss://${process.env.REACT_APP_BACKEND_URL.split("//")[1]}`,
  {
    auth: async (cb) => {
      const { value: storedAccessToken } = await Preferences.get({
        key: "accessToken",
      });
      cb({
        accessToken: storedAccessToken,
      });
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);

export default socket;
