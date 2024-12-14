import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const logout = async () => {
    try {
      await Axios.post(
        "https://backend-for-khatabook-f1cr.onrender.com/api/v1/users/logout",
        null,
        {
          withCredentials: true,
        }
      );
      setUser(null);
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
              onClick={() => setMenuOpen(false)}
            >
              {path === "/" ? "Home" : path.replace("/", "")}
            </NavLink>
          )
        )}
      </div>

      {/* User Section */}
      <div className="hidden md:flex items-center space-x-6">
        {user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePicture}
              alt="User Profile"
              className="w-9 h-9 rounded-full border-2 border-gray-700 object-cover"
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
