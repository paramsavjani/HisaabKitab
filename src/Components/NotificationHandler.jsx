import { PushNotifications } from "@capacitor/push-notifications";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";


const NotificationHandler = () => {
  const history = useHistory();

  useEffect(() => {
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        const { data } = notification.notification;
        const friendUsername = data.friendUsername;

        if(friendUsername) {
          history.push(`/dashboard`);
        }
      }
    );
  }, [history]);

  return null; // This is a utility component, so it doesn't render anything
};

export default NotificationHandler;
