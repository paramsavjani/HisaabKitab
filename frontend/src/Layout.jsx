import React, { useEffect, useState, useContext } from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Preferences } from "@capacitor/preferences";
import UserContext from "./context/UserContext.js";
import "./loading.css";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import socket from "./socket.js";

const Layout = () => {
  const {
    user,
    setUser,
    setAccessToken,
    setRefreshToken,
    setIncomingRequests,
    setSentRequests,
    setActiveFriends,
    setTransactions,
  } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getTokenFromCookies = (key) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))
      ?.split("=")[1];

  const initializeApp = async () => {
    setLoading(true);

    try {
      const { value: storedAccessToken } = await Preferences.get({
        key: "accessToken",
      });
      const { value: storedRefreshToken } = await Preferences.get({
        key: "refreshToken",
      });

      if (storedAccessToken) {
        document.cookie = `accessToken=${storedAccessToken}; path=/; secure; samesite=None`;
      }
      if (storedRefreshToken) {
        document.cookie = `refreshToken=${storedRefreshToken}; path=/; secure; samesite=None`;
      }

      const verifyResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
          }),
        }
      );

      if (!verifyResponse.ok) {
        throw new Error(
          `Failed to verify user. Status: ${verifyResponse.status}`
        );
      }

      const mahiti = await verifyResponse.json();

      const { user: verifiedUser } = mahiti;

      // If user is not found, exit early
      if (!verifiedUser) {
        console.error("No user found");
        return;
      }

      setIsAuthenticated(() => true);
      setUser(() => verifiedUser);
      setActiveFriends(() => mahiti.friends);
      setTransactions(() => mahiti.transactions);

      // Update tokens in storage
      const updatedAccessToken = getTokenFromCookies("accessToken");
      const updatedRefreshToken = getTokenFromCookies("refreshToken");

      if (updatedAccessToken) {
        await Preferences.set({
          key: "accessToken",
          value: updatedAccessToken,
        });
        setAccessToken(updatedAccessToken);
      }
      if (updatedRefreshToken) {
        await Preferences.set({
          key: "refreshToken",
          value: updatedRefreshToken,
        });
        setRefreshToken(updatedRefreshToken);
      }

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/receivedAll`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updatedAccessToken,
            updatedRefreshToken,
          }),
        }
      );
      const data = await res.json();
      setIncomingRequests(data?.data?.senders || []);
    } catch (error) {
      console.error("Initialization Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Capacitor.getPlatform() !== "web" && isAuthenticated) {
      PushNotifications.requestPermissions().then(({ receive }) => {
        if (receive === "granted") {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener("registration", async (token) => {
        const { value: storedAccessToken } = await Preferences.get({
          key: "accessToken",
        });
        const { value: storedRefreshToken } = await Preferences.get({
          key: "refreshToken",
        });
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/fcm`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedAccessToken}`,
            },
            body: JSON.stringify({
              fcmToken: token.value,
              storedAccessToken,
              storedRefreshToken,
            }),
            credentials: "include",
          }
        );
      });
      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        async (action) => {
          const path = action.notification.data.path;

          if (path) {
            window.location.href = path;
          }
        }
      );
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    socket.on("actionOnFriendRequest", ({ id, action, extra }) => {
      setSentRequests((prev) => {
        return prev.filter((r) => r.requestId !== id);
      });
      if (action === "deny") {
      } else {
        setActiveFriends((prev) => [
          ...prev,
          { totalAmount: 0, isActive: false, ...extra },
        ]);
      }
    });

    socket.on("cancelFriendRequest", ({ requestId }) => {
      setIncomingRequests((prev) => {
        return prev.filter((request) => request.requestId !== requestId);
      });
    });

    socket.on("sendFriendRequest", (request) => {
      setIncomingRequests((prev) => [...prev, request]);
    });

    return () => {
      socket.off("actionOnFriendRequest");
      socket.off("sendFriendRequest");
      socket.off("cancelFriendRequest");
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="loader">
          <div className="inner one"></div>
          <div className="inner two"></div>
          <div className="inner three"></div>
        </div>
      ) : (
        <div className="flex">
          {/* Navbar */}
          <Navbar />

          {/* Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            limit={10}
            hideProgressBar={false}
            newestOnTop
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="colored"
          />

          {/* Main Content */}
          <div className="flex-1 md:ml-80 w-full h-full">
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
