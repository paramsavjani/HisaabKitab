import React, { useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext.js";
// import DashboardSkeleton from "./DashboardSkeleton";
import "./styles.css";
import "../loading.css";
import useDashboardContext from "../context/DashboardContext.js";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  // friend:{username,name,lastTransactionTime,profilePicture}
  const { activeFriends } = useDashboardContext();

  const [totalTake, setTotalTake] = React.useState(0);
  const [totalGive, setTotalGive] = React.useState(0);

  useEffect(() => {
    setTotalTake(() => 0);
    setTotalGive(() => 0);
    activeFriends.forEach((friend) => {
      if (friend.totalAmount < 0) {
        setTotalGive((prev) => prev + friend.totalAmount);
      } else {
        setTotalTake((prev) => prev + friend.totalAmount);
      }
    });
  }, [activeFriends]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    document.title = "Dashboard";
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  return (
    <div className="p-4 md:bg-gray-950 bg-slate-950 min-h-screen text-white">
      {/* Header Section */}
      <div className="flex items-center justify-center pb-3">
        <img src="/logo.png" className="w-14 h-14" alt="CashTrack Logo" />
        <Link
          to="/"
          className="text-4xl px-1 font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-blue-500 animate-text transform transition-transform duration-300"
          aria-label="Navigate to CashTrack homepage"
        >
          Cash<span className="text-white">Track</span>
        </Link>
      </div>

      <div className="md:hidden p-4 px-0">
        {/* Combined Summary Section */}
        <div
          className="flex items-center justify-center rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: "rgba(30, 30, 30, 0.8)", // Dark background
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)", // Subtle card shadow
          }}
        >
          {/* Left Side - Total Owe */}
          <div
            className="flex-1 text-center py-2 px-3 transform transition-all duration-300"
            style={{
              borderRight: "1px solid rgba(255, 255, 255, 0.1)", // Separator
              boxShadow: "inset 0px 0 15px -5px rgba(255, 69, 69, 0.5)", // Red glow on left side
            }}
          >
            <p
              className="text-base font-semibold"
              style={{
                background: "linear-gradient(to right, #FF7A7A, #FF4B4B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Owe
            </p>
            <p className="text-xl kranky-regular font-bold text-red-400 ">
              ₹{totalGive ? Math.abs(totalGive) : 0}
            </p>
          </div>

          {/* Right Side - Total Receive */}
          <div
            className="flex-1 text-center py-2 px-3 transform transition-all duration-300"
            style={{
              boxShadow: "inset 0px 0 15px -5px rgba(69, 255, 144, 0.5)", // Green glow on right side
            }}
          >
            <p
              className="text-base font-semibold"
              style={{
                background: "linear-gradient(to right, #77FFD9, #45FF8F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Receive
            </p>
            <p className="text-xl kranky-regular font-bold text-green-400 ">
              ₹{totalTake ? totalTake : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile User List */}
      <div className="block md:hidden">
        <ul className="merienda-regular divide-y divide-gray-700">
          {activeFriends &&
            activeFriends.map((friend, index) => (
              <li
                key={friend.username}
                data-aos="fade-up"
                data-aos-delay={index * 100} // Staggered animations
              >
                <Link
                  to={`/transactions/${user?.username}--${friend.username}`}
                  className="flex items-center space-x-4 p-3"
                >
                  {/* Profile Picture */}
                  <div className="w-12 h-12">
                    <img
                      src={
                        friend.profilePicture ||
                        "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                      }
                      alt={friend.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <p className="text-base font-semibold">{friend.name}</p>
                    <p className="text-sm text-gray-400">
                      {"@" + friend.username}
                    </p>
                  </div>

                  {/* Balance */}
                  <div
                    className={`kranky-regular text-lg font-extrabold ${
                      friend.totalAmount < 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    ₹{Math.abs(friend.totalAmount)}
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Summary Section */}
        <div className="my-6 flex flex-col md:flex-row items-stretch justify-around space-y-4 md:space-y-0 md:space-x-6">
          {/* Total Owe */}
          <div
            className="p-6 rounded-lg shadow-lg w-full md:w-1/3 text-center transform transition-transform duration-300 "
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.6)", // Subtle dark background
              border: "1px solid rgba(255, 69, 69, 0.5)", // Soft red border
              boxShadow: "0px 0px 15px rgba(255, 69, 69, 0.2)", // Subtle glow effect
            }}
          >
            <p
              className="text-lg font-semibold"
              style={{
                background: "linear-gradient(to right, #FF7A7A, #FF4B4B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Owe
            </p>
            <p className="kranky-regular text-3xl font-bold text-red-400 mt-2">
              ₹{Math.abs(totalGive)}
            </p>
          </div>

          {/* Total Receive */}
          <div
            className="p-6 rounded-lg shadow-lg w-full md:w-1/3 text-center transform transition-transform duration-300 "
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.6)", // Subtle dark background
              border: "1px solid rgba(69, 255, 144, 0.5)", // Soft green border
              boxShadow: "0px 0px 15px rgba(69, 255, 144, 0.2)", // Subtle glow effect
            }}
          >
            <p
              className="text-lg font-semibold"
              style={{
                background: "linear-gradient(to right, #77FFD9, #45FF8F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Receive
            </p>
            <p className="kranky-regular text-3xl font-bold text-green-400 mt-2">
              ₹{totalTake}
            </p>
          </div>
        </div>

        {/* User List */}
        {/* Desktop User List */}
        <ul className="space-y-3">
          {activeFriends.map((friend, index) => (
            <li
              key={friend.username}
              className="bg-gray-900 rounded-lg shadow-md hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <Link
                to={`/transactions/${user?.username}--${friend.username}`}
                className="flex items-center space-x-4 p-4 pr-6"
              >
                {/* Profile Picture */}
                <div className="w-16 h-16">
                  <img
                    src={
                      friend.profilePicture ||
                      "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                    }
                    alt={friend.username}
                    className="w-full h-full rounded-full object-cover border-2 border-blue-400"
                  />
                </div>

                {/* User Info */}
                <div className="merienda-regular flex-1">
                  <p className="text-lg font-semibold">{friend.name}</p>
                  <p className="text-sm text-gray-400">@{friend.username}</p>
                </div>

                {/* Balance */}
                <div
                  className={`text-xl kranky-regular font-bold ${
                    friend.totalAmount < 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  ₹{Math.abs(friend.totalAmount)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
