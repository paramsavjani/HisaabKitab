import React, { useState, useContext } from "react";
import { FaExclamationTriangle } from "react-icons/fa"; // Error icon
import UserContext from "../context/UserContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading spinner
  const { setUser } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the window is mobile width
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  React.useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement.blur();
    setErrorMessage("");
    setLoading(true); // Set loading state to true when form is submitted

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
        setLoading(false); // Reset loading state after response
        return;
      }

      // Handle errors from backend validation
      if (data.statusCode >= 400) {
        setErrorMessage(data.message.message);
        setLoading(false); // Reset loading state after response
      } else {
        setUser(data.data.user);
        window.location.href = "/friends";
      }
    } catch (e) {
      console.error("Network or server error", e);
      setErrorMessage("Failed to connect to the server. Please try again.");
      setLoading(false); // Reset loading state after error
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isMobile
          ? "bg-gradient-to-b from-black to-gray-900" // Black background for mobile
          : "bg-gradient-to-b from-black to-gray-900" // Gradient for desktop view
      }`}
    >
      <div
        className={`${
          isMobile
            ? "bg-transparent" // Transparent background for mobile to blend into black background
            : "bg-gray-800" // Dark background for desktop
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
            disabled={loading} // Disable button while loading
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
