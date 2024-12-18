import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const UserList = ({ friends }) => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      {/* Header Section */}
      <div className="py-4 text-center mb-2 pt-1">
        <h1
          className="text-3xl font-bold pl-7"
          style={{
            background: "linear-gradient(to right, #00B4DB, #00FF94)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Transaction Summary
        </h1>
      </div>

      <div className="md:hidden p-4">
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
            className="flex-1 text-center py-4 px-4 transform transition-all duration-300"
            style={{
              borderRight: "1px solid rgba(255, 255, 255, 0.1)", // Separator
              boxShadow: "inset 0px 0 15px -5px rgba(255, 69, 69, 0.5)", // Red glow on left side
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
            <p className="text-2xl font-bold text-red-400 mt-1">₹1500</p>
          </div>

          {/* Right Side - Total Receive */}
          <div
            className="flex-1 text-center py-4 px-4 transform transition-all duration-300"
            style={{
              boxShadow: "inset 0px 0 15px -5px rgba(69, 255, 144, 0.5)", // Green glow on right side
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
            <p className="text-2xl font-bold text-green-400 mt-1">₹2500</p>
          </div>
        </div>
      </div>

      {/* Mobile User List */}
      <ul className="block md:hidden space-y-3">
        {friends.map((friend, index) => (
          <li
            key={friend.id}
            className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg shadow-md"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            {/* Profile Picture */}
            <div className="w-14 h-14">
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
            <div className="flex-1">
              <p className="text-lg font-semibold">{friend.name}</p>
              <p className="text-sm text-gray-400">@{friend.username}</p>
            </div>

            {/* Balance */}
            <div
              className={`text-base font-bold ${
                friend.balance < 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              ₹{friend.balance}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Summary Section */}
        <div className="mb-6 flex flex-col items-center space-y-4 md:flex-row md:justify-around">
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
            <p className="text-3xl font-bold text-red-400 mt-2">₹1500</p>
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
            <p className="text-3xl font-bold text-green-400 mt-2">₹2500</p>
          </div>
        </div>

        {/* User List */}
        <ul className="space-y-3">
          {friends.map((friend, index) => (
            <li
              key={friend.id}
              className="flex items-center space-x-4 bg-gray-800 p-4 pr-6 rounded-lg shadow-md hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
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
              <div className="flex-1">
                <p className="text-lg font-semibold">{friend.name}</p>
                <p className="text-sm text-gray-400">@{friend.username}</p>
              </div>

              {/* Balance */}
              <div
                className={`text-lg font-bold ${
                  friend.balance < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                ₹{friend.balance}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Example Usage
const friends = [
  { id: 1, name: "Alice", username: "alice123", balance: -200 },
  { id: 2, name: "Bob", username: "bobby456", balance: 500 },
  { id: 3, name: "Charlie", username: "charlie789", balance: -300 },
  { id: 4, name: "David", username: "david321", balance: 1000 },
];

export default function App() {
  return <UserList friends={friends} />;
}
