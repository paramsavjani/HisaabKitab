import React, { useEffect, useState, useContext } from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Preferences } from "@capacitor/preferences";
import UserContext from "./context/UserContext.js";
import useDashboardContext from "./context/DashboardContext.js";
import "./loading.css";

const Layout = () => {
  const {
    setUser,
    setAccessToken,
    setRefreshToken,
    accessToken,
    refreshToken,
  } = useContext(UserContext);
  const { setTotalGive, setTotalTake, setActiveFriends } =
    useDashboardContext();
  const [loading, setLoading] = useState(true);

  // Helper function to retrieve tokens from cookies
  const getTokenFromCookies = (key) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`))
      ?.split("=")[1];

  // Fetch User Details and Tokens
  const fetchUserDetails = async () => {
    const { value: storedAccessToken } = await Preferences.get({
      key: "accessToken",
    });
    const { value: storedRefreshToken } = await Preferences.get({
      key: "refreshToken",
    });

    // Save tokens to cookies for backend compatibility
    if (storedAccessToken) {
      document.cookie = `accessToken=${storedAccessToken}; path=/; secure; samesite=None`;
    }
    if (storedRefreshToken) {
      document.cookie = `refreshToken=${storedRefreshToken}; path=/; secure; samesite=None`;
    }

    // Verify tokens with the backend
    const response = await fetch(
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

    if (!response.ok) {
      throw new Error(`Failed to verify user. Status: ${response.status}`);
    }

    const { user } = await response.json();
    setUser(user);

    // Update tokens in storage
    const updatedAccessToken = getTokenFromCookies("accessToken");
    const updatedRefreshToken = getTokenFromCookies("refreshToken");

    if (updatedAccessToken) {
      await Preferences.set({ key: "accessToken", value: updatedAccessToken });
    }
    if (updatedRefreshToken) {
      await Preferences.set({
        key: "refreshToken",
        value: updatedRefreshToken,
      });
    }

    setAccessToken(updatedAccessToken);
    setRefreshToken(updatedRefreshToken);
  };

  // Fetch Friends and Transaction Data
  const fetchDashboardData = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const { friends, totalGive, totalTake } = await response.json();
    setActiveFriends(friends);
    setTotalGive(totalGive);
    setTotalTake(totalTake);
  };

  // Main Initialization Function
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true); // Start loading

        // Fetch user and dashboard data in sequence
        await fetchUserDetails();
        await fetchDashboardData();

        // Push to dashboard after all data is loaded
        window.history.pushState({}, "", "/dashboard");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setLoading(false); // Finish loading
      }
    };

    initializeApp();
  }, [setUser]); // Empty dependency array ensures this runs only once

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
