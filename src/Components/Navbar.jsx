import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import Axios from "axios";
import {
  FaBars,
  FaUserCog,
  FaSpinner,
  FaMoneyCheckAlt,
  FaUsers,
  FaHome,
  FaUserFriends,
  FaSearch,
} from "react-icons/fa";
import { useContext } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for logout button
  const [incomingRequests, setIncomingRequests] = useState(0);
  const { user, setUser } = useContext(UserContext);

  // Ref to detect outside clicks
  const navRef = useRef();

  useEffect(() => {
    if (user) {
      Axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/receivedAll`,
        {
          withCredentials: true,
        }
      )
        .then((response) => {
          setIncomingRequests(response?.data?.data?.senders?.length || 0);
        })
        .catch((error) => {
          console.error("Failed to fetch incoming requests count", error);
        });
    }
  }, [user]);

  // Logout function with logging
  const logout = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      window.location.reload();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
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
        className={`md:hidden text-white text-2xl p-4 fixed top-2 left-2 z-50 ${
          menuOpen ? "hidden" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        <FaBars />
      </button>

      {/* Navbar */}
      <nav
        ref={navRef}
        className={`bg-black p-4 shadow-xl fixed left-0 top-0 w-80 h-full z-40 flex flex-col justify-between transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-1 py-6">
          <img
            src="http://res.cloudinary.com/dso4amwem/image/upload/v1734325639/zozxrirfkw14gweuq3hq.webp"
            className="w-14 h-14"
            alt="CashTrack Logo"
          />
          <Link
            to="/"
            className="text-3xl font-extrabold text-white hover:text-green-500 transition-colors duration-300"
            aria-label="Navigate to CashTrack homepage"
          >
            Cash<span className="text-green-500">Track</span>
          </Link>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex flex-col items-start space-y-4 bg-black p-4 w-full">
          {[
            { to: "/", label: "Home", icon: <FaHome /> },
            { to: "/friends", label: "Friends", icon: <FaUserFriends /> },
            { to: "/search", label: "Search", icon: <FaSearch /> },
            {
              to: "/add-one",
              label: "Add Transaction",
              icon: <FaMoneyCheckAlt />,
            },
            { to: "/split-expense", label: "Split Expense", icon: <FaUsers /> },
          ].map(({ to, label, icon }, index) => (
            <NavLink
              key={index}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-2 text-gray-300 hover:text-green-500 transition-colors duration-300 font-medium uppercase tracking-wide ${
                  isActive ? "text-green-500 underline" : ""
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          {user && (
            <NavLink
              to="/incoming-requests"
              className={({ isActive }) =>
                `flex items-center justify-between w-full px-4 py-2 rounded-lg transition duration-300 ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-green-500"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">
                  📩{" "}
                  {/* Use an envelope icon or replace it with an icon library */}
                </span>
                <span className="font-medium text-sm uppercase tracking-wide">
                  Incoming Requests
                </span>
              </div>
              {incomingRequests > 0 && (
                <span className="flex items-center justify-center bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full shadow-lg animate-pulse">
                  {incomingRequests}
                </span>
              )}
            </NavLink>
          )}
        </div>

        {/* User Information */}
        <div className="p-4 text-white">
          {user ? (
            <div className="w-full flex flex-col space-y-4">
              <Link
                to={`/users/${user.username}`}
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
                    <img
                      src={
                        user.profilePicture || "https://via.placeholder.com/50"
                      }
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* User Details */}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm text-white truncate">
                      {user.username || "User"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email || "example@email.com"}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center space-x-2 text-gray-300 hover:text-green-500 transition-colors duration-300"
              >
                <FaUserCog />
                <span>Settings</span>
              </Link>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300 w-full flex items-center justify-center"
                disabled={loading}
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
              onClick={() => setMenuOpen(false)}
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
