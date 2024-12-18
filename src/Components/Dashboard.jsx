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

      {/* Mobile Summary Section */}
      <div className="md:hidden flex justify-around items-center px-4 py-3 mb-4 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-sm text-gray-400">You Will Give</p>
          <p className="text-lg text-green-400 font-bold">₹0</p>
        </div>
        <div className="border-l-2 border-gray-600 h-6"></div>
        <div className="text-center">
          <p className="text-sm text-gray-400">You Will Get</p>
          <p className="text-lg text-red-400 font-bold">₹910</p>
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
          <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full md:w-1/3 text-center">
            <p className="text-green-300 text-lg font-semibold">Total Owe</p>
            <p className="text-2xl font-bold text-red-400">₹1500</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full md:w-1/3 text-center">
            <p className="text-green-300 text-lg font-semibold">
              Total Receive
            </p>
            <p className="text-2xl font-bold text-green-400">₹2500</p>
          </div>
        </div>

        {/* User List */}
        <ul className="space-y-4">
          {friends.map((friend, index) => (
            <li
              key={friend.id}
              className="flex items-center space-x-6 bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
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
