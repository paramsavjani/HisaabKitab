import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Axios from "axios";
import { FaBars, FaTimes, FaUserCog } from "react-icons/fa";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);

  // Logout function
  const logout = async () => {
    try {
      await Axios.post(
        "https://backend-for-khatabook-f1cr.onrender.com/api/v1/users/logout",
        null,
        { withCredentials: true }
      );
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div>
      {/* Hamburger Menu Button */}
      <button
        className="md:hidden text-white text-2xl p-4 fixed top-0 left-0 z-50"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navbar */}
      <nav
        className={`bg-black p-4 shadow-xl fixed left-0 top-0 w-64 h-full z-40 flex flex-col items-start transition-all duration-500 ease-in-out ${
          menuOpen ? "block" : "hidden"
        } md:block`}
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
          {["/", "/features", "/about", "/contact", "/friends"].map(
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
        <div className="mt-auto p-4 flex flex-col items-start text-white">
          {user ? (
            <div className="w-full flex flex-col items-start space-y-4">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4">
                <img
                  src={user.profilePicture}
                  alt="User Profile"
                  className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
                />
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              {/* Navigation Links for User */}
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-gray-300 hover:text-green-500 transition-colors duration-300"
              >
                <FaUserCog />
                <span>Settings</span>
              </Link>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded-lg shadow-md transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-lg shadow-md transition duration-300"
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
