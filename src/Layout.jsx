import React, { useEffect } from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Components/Footer";
import UserContext from "./context/UserContext";
import { useContext } from "react";

const Layout = () => {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const checkUser = async () => {
      try {
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
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
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

      {/* Main Content */}
      <div className="flex-1 md:ml-80">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
