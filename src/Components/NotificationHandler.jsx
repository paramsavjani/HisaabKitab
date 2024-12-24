import { PushNotifications } from "@capacitor/push-notifications";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

const NotificationHandler = () => {
  const history = useNavigate();

  useEffect(() => {
    if (Capacitor.isPluginAvailable("PushNotifications")) {
      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          const { data } = notification.notification;
          const friendUsername = data.friendUsername;

          if (friendUsername) {
            history.push(`/dashboard`);
          }
        }
      );
    }
  }, [history]);

  return null; // This is a utility component, so it doesn't render anything
};

export default NotificationHandler;
