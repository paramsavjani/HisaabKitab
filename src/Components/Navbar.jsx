import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import Axios from "axios";
import { FaBars, FaUserCog, FaSpinner } from "react-icons/fa";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for logout button
  const { user, setUser } = useContext(UserContext);

  // Ref to detect outside clicks
  const navRef = useRef();

  // Logout function with logging
  const logout = async () => {
    setLoading(true); // Set loading to true when logout starts

    // Log the logout action (for debugging purposes or tracking)
    console.log(`[LOG] User ${user.username || "Unknown"} is logging out.`);

    try {
      // Log the logout attempt to the server (for analytics or tracking)
      await Axios.post(
        "https://backend-for-khatabook-f1cr.onrender.com/api/v1/users/logout",
        null,
        { withCredentials: true }
      );

      // After successful logout, clear user data and log success
      console.log(
        `[LOG] User ${user.username || "Unknown"} has logged out successfully.`
      );
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);

      // Log the error if logout fails
      console.log(
        `[ERROR] Logout failed for user ${user.username || "Unknown"}. Error: ${
          e.message
        }`
      );
    } finally {
      setLoading(false); // Set loading to false after the logout process is done
    }
  };

  // Detect click outside the navbar to close it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false); // Close the navbar
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  return (
    <div className="flex">
      {/* Hamburger Menu Button for Mobile */}
      <button
        className={
          `md:hidden text-white text-2xl p-4 fixed top-2 left-2 z-50 ` +
          (menuOpen ? "hidden" : "")
        }
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        <FaBars />
      </button>

      {/* Navbar */}
      <nav
        ref={navRef}
        className={`bg-black p-4 shadow-xl fixed left-0 top-0 w-64 h-full z-40 flex flex-col justify-between transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="text-3xl font-extrabold text-white py-6">
          <Link
            to="/"
            className="hover:text-green-500 transition-colors duration-300"
          >
            Cash<span className="text-green-500">Track</span>
          </Link>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex flex-col items-start space-y-4 bg-black p-4 w-full">
          {["/", "/features", "/about", "/contact", "/friends", "/search"].map(
            (path, index) => (
              <NavLink
                key={index}
                to={path}
                className={({ isActive }) =>
                  `text-gray-300 hover:text-green-500 transition-colors duration-300 font-medium uppercase tracking-wide ${
                    isActive ? "text-green-500 underline" : ""
                  }`
                }
                onClick={() => setMenuOpen(false)} // Close menu on click
              >
                {path === "/" ? "Home" : path.replace("/", "")}
              </NavLink>
            )
          )}
        </div>

        {/* User Information */}
        <div className="p-4 text-white">
          {user ? (
            <div className="w-full flex flex-col space-y-4">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4">
                <img
                  src={user.profilePicture || "https://via.placeholder.com/50"}
                  alt="User Profile"
                  className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
                />
                <div>
                  <p className="font-medium">{user.username || "User"}</p>
                  <p className="text-sm text-gray-400">
                    {user.email || "example@email.com"}
                  </p>
                </div>
              </div>

              {/* Settings and Logout */}
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-gray-300 hover:text-green-500 transition-colors duration-300"
              >
                <FaUserCog />
                <span>Settings</span>
              </Link>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 w-full flex items-center justify-center"
                disabled={loading} // Disable button when loading
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
