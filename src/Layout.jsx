import React, { useEffect, useState, useContext } from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Preferences } from "@capacitor/preferences";
import UserContext from "./context/UserContext.js";
import useDashboardContext from "./context/DashboardContext.js";
import "./loading.css";

const Layout = () => {
  const { user, setUser, setAccessToken, setRefreshToken } =
    useContext(UserContext);
  const { setTotalGive, setTotalTake, setActiveFriends } =
    useDashboardContext();
  const [loading, setLoading] = useState(true);

  const getTokenFromCookies = (key) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))
      ?.split("=")[1];

  const initializeApp = async () => {
    setLoading(true);

    try {
      // Fetch User Details and Dashboard Data
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

      const { user: verifiedUser } = await verifyResponse.json();

      // If user is not found, exit early
      if (!verifiedUser) {
        console.error("No user found");
        return;
      }

      setUser(() => verifiedUser);

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

      // Fetch Dashboard Data
      const dashboardResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: updatedAccessToken,
            refreshToken: updatedRefreshToken,
          }),
        }
      );

      if (!dashboardResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const { friends, totalGive, totalTake } = await dashboardResponse.json();
      setActiveFriends(() => friends);
      setTotalGive(() => totalGive);
      setTotalTake(() => totalTake);

      // Push to dashboard after all data is loaded
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      console.error("Initialization Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();
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
