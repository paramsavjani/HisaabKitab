import React, { useEffect } from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router-dom";
// import Footer from "./Components/Footer";
import UserContext from "./context/UserContext";
import { useContext } from "react";
import { ToastContainer } from "react-toastify";
import { Storage } from "@capacitor/storage";

const Layout = () => {
  const { setUser } = useContext(UserContext);

useEffect(() => {
  const checkUser = async () => {
    try {
      const { value: accessToken } = await Storage.get({ key: "accessToken" });
      const { value: refreshToken } = await Storage.get({
        key: "refreshToken",
      });

      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=None`;
      }

      if (accessToken) {
        document.cookie = `accessToken=${accessToken}; path=/; secure; samesite=None`;
      }

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/verify`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setUser(data.user);

      // Update tokens in Capacitor Storage
      const newAccessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];
      const newRefreshToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("refreshToken="))
        ?.split("=")[1];

      if (newAccessToken) {
        await Storage.set({ key: "accessToken", value: newAccessToken });
      }

      if (newRefreshToken) {
        await Storage.set({ key: "refreshToken", value: newRefreshToken });
      }
    } catch (e) {
      console.error("Error fetching user", e);
    }
  };

  checkUser();
}, [setUser]);


  return (
    <div className="flex">
      {/* Navbar */}
      <Navbar />
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

        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;
