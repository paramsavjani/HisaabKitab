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
    <nav className="bg-black p-4 shadow-lg flex items-center justify-between fixed top-0 left-0 w-full z-50">
      {/* Logo */}
      <div className="text-3xl font-bold text-white">
        <Link to="/" className="hover:text-green-500 transition duration-200">
          Cash<span className="text-green-500">Track</span>
        </Link>
      </div>

      {/* Hamburger Menu for Mobile - Positioned to the Right */}
      <div
        className="md:hidden text-white text-2xl cursor-pointer ml-auto"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row items-center md:items-center space-y-4 md:space-y-0 md:space-x-6 text-right absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent p-4 md:p-0`}
      >
        {["/", "/features", "/about", "/login"].map((path, index) => (
          <NavLink
            key={index}
            to={path}
            className={({ isActive }) =>
              `text-gray-300 hover:text-green-500 transition duration-200 font-medium ${
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
      <div className="flex items-center space-x-6">
        {user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePicture}
              alt="profile"
              className="w-10 h-10 rounded-full border-2 border-gray-700"
            />
            <span className="font-medium text-gray-300">{user.username}</span>
            <button
              onClick={logout}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-lg transition duration-200 md:block hidden"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
