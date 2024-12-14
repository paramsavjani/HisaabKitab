import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import Axios from "axios";
import { FaBars, FaTimes, FaUserCog } from "react-icons/fa";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // State for the profile dropdown
  const { user, setUser } = useContext(UserContext);

  const dropdownRef = useRef(null); // Reference to the dropdown menu

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <nav className="bg-black p-4 shadow-lg fixed top-0 left-0 w-full z-50 flex items-center justify-between transition-all duration-500 ease-in-out">
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
        } md:flex flex-col md:flex-row items-center md:space-y-0 space-y-4 md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent p-6 md:p-0 shadow-lg md:shadow-none transition-all duration-300 ease-in-out`}
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
          <div className="relative">
            {/* Profile Button */}
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2"
            >
              <img
                src={user.profilePicture}
                alt="User Profile"
                className="w-9 h-9 rounded-full border-2 border-gray-700 object-cover transform transition-transform duration-300 hover:scale-110 hover:rotate-12"
              />
            </button>

            {/* Rock Dominion Style Profile Dropdown */}
            {profileMenuOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 bg-gradient-to-r from-gray-900 to-black text-white shadow-xl rounded-lg w-48 mt-2 transition-all duration-500 ease-in-out transform translate-y-2 opacity-100"
              >
                <div className="p-4 border-b border-gray-700">
                  <p className="font-medium text-lg">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <div className="p-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-md transition-all duration-300 ease-in-out transform">
                  <FaUserCog />
                  <span>Settings</span>
                </div>
                <div
                  onClick={logout}
                  className="p-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-md transition-all duration-300 ease-in-out transform"
                >
                  Logout
                </div>
              </div>
            )}
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

      {/* Mobile Overlay (Darkened Background for Menu) */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40 transition-all duration-500 ease-in-out"
        />
      )}
    </nav>
  );
}

export default Navbar;
