import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext.js";

// Import PNG images
import HomeIcon from "../assets/icons/home.png";
import FriendsIcon from "../assets/icons/friend1.png";
import SearchIcon from "../assets/icons/search.png";
import AddTransactionIcon from "../assets/icons/transfer1.png";
import SplitExpenseIcon from "../assets/icons/group.png";
import SettingIcon from "../assets/icons/gear1.png";
import { Preferences } from "@capacitor/preferences";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState(0);
  const {
    user,
    setUser,
    accessToken,
    refreshToken,
    setAccessToken,
    setRefreshToken,
  } = useContext(UserContext);

  const navRef = useRef();
  const startX = useRef(0);
  const startY = useRef(0);
  const closeX = useRef(0);
  const closeY = useRef(0);

  useEffect(() => {
    async function param() {
      if (user) {
        try {
          const res = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/receivedAll`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                accessToken,
                refreshToken,
              }),
            }
          );
          const data = await res.json();
          setIncomingRequests(data.data.senders.length);
        } catch (e) {
          console.error("Error fetching requests:", e);
        }
      }
    }
    param();
  }, [user, accessToken, refreshToken]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Ignore gestures with multiple fingers
      if (e.touches.length > 1) {
        return;
      }
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      // Ignore gestures with multiple fingers
      if (e.changedTouches.length > 1) {
        return;
      }
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const distanceX = endX - startX.current;
      const distanceY = Math.abs(endY - startY.current);

      // Detect swipe gesture for opening the menu
      if (distanceY <= 25 && distanceX > 40) {
        setMenuOpen(true);
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Ignore gestures with multiple fingers
      if (e.touches.length > 1) {
        return;
      }
      closeX.current = e.touches[0].clientX;
      closeY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      // Ignore gestures with multiple fingers
      if (e.changedTouches.length > 1) {
        return;
      }
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const distanceX = closeX.current - endX;
      const distanceY = Math.abs(closeY.current - endY);

      // Detect swipe gesture for closing the menu
      if (distanceY <= 25 && distanceX > 40) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      await Preferences.remove({ key: "accessToken" });
      await Preferences.remove({ key: "refreshToken" });

      setAccessToken(null);
      setRefreshToken(null);

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
      {/* Hamburger Menu Button */}
      <button
        className={`md:hidden text-white text-2xl p-4 fixed top-2 left-2 z-50 ${
          menuOpen ? "hidden" : ""
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span>☰</span> {/* Replace with your desired hamburger menu icon */}
      </button>

      {/* Navbar */}
      <nav
        ref={navRef}
        className={`bg-slate-900 p-4 shadow-xl fixed left-0 top-0 w-80 h-full z-40 flex flex-col justify-between transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-1 py-6">
          <img src="/logo.png" className="w-14 h-14" alt="CashTrack Logo" />
          <Link
            to="/"
            className="henny-penny-regular text-4xl px-1 font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-blue-500 animate-text transform transition-transform duration-300"
            aria-label="Navigate to CashTrack homepage"
          >
            Hisaab <span className="text-white">Kitab</span>
          </Link>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex flex-col items-start space-y-1 md:space-y-2 p-4 w-full">
          {[
            { to: "/", label: "Home", icon: HomeIcon },
            { to: "/friends", label: "Friends", icon: FriendsIcon },
            { to: "/search", label: "Search", icon: SearchIcon },
            {
              to: "/add-one",
              label: "Add Transaction",
              icon: AddTransactionIcon,
            },
            {
              to: "/split-expense",
              label: "Split Expense",
              icon: SplitExpenseIcon,
            },
          ].map(({ to, label, icon }, index) => (
            <NavLink
              key={index}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between w-full px-4 py-2 rounded-lg transition duration-300 ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={icon}
                  alt={`${label} Icon`}
                  className="w-8 h-8 md:w-6 md:h-6"
                />
                <span className="font-medium text-sm uppercase tracking-wide">
                  {label}
                </span>
              </div>
            </NavLink>
          ))}

          {user && (
            <NavLink
              to="/incoming-requests"
              className={({ isActive }) =>
                `flex items-center justify-between w-full px-4 py-2 rounded-lg transition duration-300 ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg text-green-500">📩</span>
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
        <div className="md:p-4 p-1 text-white">
          {user ? (
            <div className="w-full flex flex-col space-y-2 md:space-y-3">
              {/* User Profile */}
              <Link
                to={`/users/${user.username}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center space-x-3"
              >
                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
                  <img
                    src={
                      user.profilePicture ||
                      "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                    }
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-sm text-white truncate">
                    {user.username || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email || "example@email.com"}
                  </p>
                </div>
              </Link>

              {/* Settings Option */}
              <NavLink
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between w-full px-4 py-2 rounded-lg transition duration-300 ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={SettingIcon}
                    className="w-6 h-6"
                    alt="Settings Icon"
                  />
                  <span className="font-medium text-sm uppercase tracking-wide">
                    Settings
                  </span>
                </div>
              </NavLink>

              {/* Logout Button */}
              <button
                onClick={logout}
                className={`w-full flex items-center justify-center px-4 py-2 md:py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-lg hover:from-red-600 hover:to-red-700 text-white font-bold tracking-wide transition-transform duration-300 ${
                  loading ? "opacity-75 cursor-not-allowed" : "hover:scale-105"
                }`}
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
                  </span>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 shadow-lg text-white font-bold tracking-wide hover:scale-105 transform transition-transform duration-300"
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
