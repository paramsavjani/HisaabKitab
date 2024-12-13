import React, { useEffect, useState } from "react";
import Axios from "axios";
import Navbar from "./Components/Navbar/Navbar.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.get(
          "http://localhost:1000/api/v1/users/verify",
          { withCredentials: true }
        );
        setUser(response.data.data.user);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, []);

  async function login() {
    try {
      const response = await Axios.post(
        "http://localhost:1000/api/v1/users/login",
        {
          username: "c",
          password: "param12",
        },
        { withCredentials: true }
      );
      setUser(response.data.data.user);
    } catch (e) {
      console.log(e);
    }
  }

  async function logout() {
    try {
      await Axios.post("http://localhost:1000/api/v1/users/logout", null, {
        withCredentials: true,
      });

      // Clear user state
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  return <h1 className="text-7xl font-bold underline text-cyan-50">Hello world!</h1>;
}

export default App;
