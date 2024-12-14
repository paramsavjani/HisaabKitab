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
          "https://backend-for-khatabook-f1cr.onrender.com/api/v1/users/verify",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        setUser(data.data.user);
      } catch (e) {
        console.error("Error fetching user", e);
      }
    };
    checkUser();
  }, [setUser]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
