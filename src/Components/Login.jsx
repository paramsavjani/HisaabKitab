import React, { useState, useContext } from "react";
import { FaExclamationTriangle } from "react-icons/fa"; // Error icon
import { FaSpinner } from "react-icons/fa"; // Spinner icon
import UserContext from "../context/UserContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading spinner
  const { setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
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
              className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
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
              className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
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
            className={`w-full py-2 rounded-lg transition duration-200 ${
              loading
                ? "bg-green-700 text-gray-100 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>Logging in...</span>
              </div>
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
