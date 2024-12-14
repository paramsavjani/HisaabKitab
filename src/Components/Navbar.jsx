import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Logout function to handle the user logout
  const logout = async () => {
    try {
      await Axios.post("http://localhost:1000/api/v1/users/logout", null, {
        withCredentials: true,
      });
      window.location.reload(); // Refresh to reset user state
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <nav className="bg-black p-4 shadow-lg fixed top-0 left-0 w-full z-50 flex items-center justify-between">
      {/* Logo */}
      <div className="text-3xl font-extrabold text-white">
        <Link
          to="/"
          className="hover:text-green-500 transition-colors duration-300"
        >
          Cash<span className="text-green-500">Track</span>
        </Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <button
        className="md:hidden text-white text-2xl focus:outline-none ml-auto"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation Links */}
      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row items-center md:space-y-0 space-y-4 md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent p-6 md:p-0 shadow-lg md:shadow-none`}
      >
        {["/", "/features", "/about", "/contact"].map((path, index) => (
          <NavLink
            key={index}
            to={path}
            className={({ isActive }) =>
              `text-gray-300 hover:text-green-500 transition-colors duration-300 font-medium uppercase tracking-wide ${
                isActive ? "text-green-500 underline" : ""
              }`
            }
            onClick={() => setMenuOpen(false)}
          >
            {path === "/" ? "Home" : path.replace("/", "")}
          </NavLink>
        ))}
      </div>

      {/* User Section */}
      <div className="hidden md:flex items-center space-x-6">
        {user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePicture}
              alt="User Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
            />
            <span className="font-medium text-gray-300 capitalize">
              {user.username}
            </span>
            <button
              onClick={logout}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-lg shadow-md transition duration-300"
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
  );
}

export default Navbar;
