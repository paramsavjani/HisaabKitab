import React, { useState, useContext, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import UserContext from "../context/UserContext.js";
import { Preferences } from "@capacitor/preferences";
import useDashboardContext from "../context/DashboardContext.js";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser, setRefreshToken, setAccessToken } =
    useContext(UserContext);
  const [isMobile, setIsMobile] = useState(false);
  const { setTotalGive, setTotalTake, setActiveFriends } = useDashboardContext();

  useEffect(() => {
    if (user) {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [user]);

  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  React.useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async (accessToken, refreshToken) => {
    try {
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
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement.blur();
    setErrorMessage("");
    setLoading(true);

    const userCredentials = { username, password };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userCredentials),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "An unknown error occurred.";
        setErrorMessage(errorMessage);
        setLoading(false);
        return;
      }

      if (data.statusCode >= 400) {
        setErrorMessage(data.message.message);
        setLoading(false);
      } else {
        setUser(data.data.user);

        await Preferences.set({
          key: "accessToken",
          value: data.data.accessToken,
        });
        await Preferences.set({
          key: "refreshToken",
          value: data.data.refreshToken,
        });

        setAccessToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);

        // Fetch dashboard data after successful login
        await fetchDashboardData(data.data.accessToken, data.data.refreshToken);

        window.history.pushState({}, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    } catch (e) {
      console.error("Network or server error", e);
      setErrorMessage("Failed to connect to the server. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isMobile
          ? "bg-gradient-to-b from-black to-gray-900"
          : "bg-gradient-to-b from-black to-gray-900"
      }`}
    >
      <div
        className={`${
          isMobile ? "bg-transparent" : "bg-gray-800"
        } p-8 rounded-lg shadow-lg w-full max-w-md`}
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 md:bg-gray-700 bg-slate-900 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 md:bg-gray-700 bg-slate-900 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error message display with icon and styling */}
          {errorMessage && (
            <div className="flex items-center text-red-500 p-2 mt-2 rounded-lg">
              <FaExclamationTriangle className="mr-2" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:scale-105 hover:ring-2 hover:ring-green-500 transition-transform duration-300 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-green-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
