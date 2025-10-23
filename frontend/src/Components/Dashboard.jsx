"use client"

import { useEffect, useContext, useState } from "react"
import { Link } from "react-router-dom"
import UserContext from "../context/UserContext.js"
import split from "../assets/icons/group.png"

const Dashboard = () => {
  const { user, activeFriends } = useContext(UserContext)
  const [totalTake, setTotalTake] = useState(0)
  const [totalGive, setTotalGive] = useState(0)

  useEffect(() => {
    setTotalTake(() => 0)
    setTotalGive(() => 0)
    activeFriends.forEach((friend) => {
      if (friend.totalAmount < 0) {
        setTotalGive((prev) => prev + Number(friend.totalAmount))
      } else {
        setTotalTake((prev) => prev + Number(friend.totalAmount))
      }
    })
  }, [activeFriends])

  useEffect(() => {
    document.title = "Dashboard"
  }, [user])

  useEffect(() => {
    activeFriends.sort((a, b) => {
      if (a.lastTransactionTime < b.lastTransactionTime) {
        return 1
      } else {
        return -1
      }
    })
  }, [activeFriends])

  const formatTimeAgo = (timestamp) => {
    const lastTransactionTime = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - lastTransactionTime) / 1000)

    if (diffInSeconds < 60) return "a few seconds ago"
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months} month${months > 1 ? "s" : ""} ago`
    }
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} year${years > 1 ? "s" : ""} ago`
  }


  return (
    <div
      className="p-4 min-h-screen text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,0.06), rgba(0,0,0,0) 60%), radial-gradient(1000px 500px at 110% 10%, rgba(59,130,246,0.06), rgba(0,0,0,0) 55%), linear-gradient(180deg, #0a0a0b 0%, #050505 100%)",
      }}
    >
      {/* Header Section */}
      <div className="merienda-regular flex items-center justify-center pb-3">
        <Link to="/" className="px-3 py-1 rounded-2xl border border-white/5 bg-black/30 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
            Hisaab <span className="text-white">Kitab</span>
          </span>
        </Link>
      </div>

      {/* Mobile Summary Section */}
      <div className="md:hidden p-4 px-0">
        <div
          className="flex items-center justify-center rounded-2xl overflow-hidden backdrop-blur-md border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{
            backgroundColor: "rgba(8, 8, 9, 0.75)",
          }}
        >
          {/* Left Side - Total Owe */}
          <div
            className="flex-1 text-center py-4 px-3 border-r border-white/5"
            style={{
              boxShadow: "inset 0px 0 12px -6px rgba(239,68,68,0.35)",
            }}
          >
            <p
              className="text-lg font-semibold lobster-regular"
              style={{
                background: "linear-gradient(to right, #ff7a7a, #ff4b4b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pay Up!
            </p>
            <p className="text-2xl kranky-regular font-bold text-red-400">
              ₹{totalGive ? Math.abs(totalGive).toFixed(2) : "0.00"}
            </p>
          </div>

          {/* Right Side - Total Receive */}
          <div
            className="flex-1 text-center py-4 px-3"
            style={{
              boxShadow: "inset 0px 0 12px -6px rgba(16,185,129,0.35)",
            }}
          >
            <p
              className="text-lg font-semibold lobster-regular"
              style={{
                background: "linear-gradient(to right, #77ffd9, #45ff8f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cash Incoming!
            </p>
            <p className="text-2xl kranky-regular font-bold text-green-400">
              ₹{totalTake ? parseFloat(totalTake).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile User List */}
      <div className="block md:hidden">
        <ul
          className="merienda-regular divide-y divide-white/5 rounded-2xl overflow-hidden backdrop-blur-md border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
          style={{
            backgroundColor: "rgba(10, 10, 11, 0.55)",
          }}
        >
          {activeFriends &&
            activeFriends.map(
              (friend, index) =>
                friend.isActive && (
                  <li key={friend.username}>
                      <Link
                        to={`/transactions/${user?.username}--${friend.username}`}
                        className="flex items-center space-x-4 p-4"
                      >
                        {/* Profile Picture */}
                        <div className="w-12 h-12 relative">
                          <img
                            src={
                              friend.profilePicture
                                ? `${friend.profilePicture}`
                                : "/user2.png"
                            }
                            alt={friend.username}
                            className="w-full h-full rounded-full object-cover shadow-md border"
                            style={{
                              borderColor:
                                friend.totalAmount < 0
                                  ? "rgba(239,68,68,0.45)"
                                  : "rgba(16,185,129,0.45)",
                              boxShadow:
                                friend.totalAmount < 0
                                  ? "0 0 12px rgba(239,68,68,0.35)"
                                  : "0 0 12px rgba(16,185,129,0.35)",
                            }}
                          />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 overflow-hidden">
                          <p className="text-base font-semibold truncate">
                            {friend.name}
                          </p>
                          <p className="text-xs text-gray-400">{formatTimeAgo(friend.lastTransactionTime)}</p>
                        </div>

                        {/* Balance */}
                        <div
                          className={`kranky-regular text-lg font-extrabold ${
                            friend.totalAmount < 0 ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          ₹{Math.abs(friend.totalAmount).toFixed(2)}
                        </div>
                      </Link>
                    </li>
                  ),
              )}
        </ul>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Summary Section */}
        <div className="my-8 flex flex-col md:flex-row items-stretch justify-around space-y-4 md:space-y-0 md:space-x-8">
          {/* Total Owe */}
          <div
            className="p-8 rounded-2xl w-full md:w-1/3 text-center border border-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            style={{
              backgroundColor: "rgba(10, 10, 11, 0.6)",
              boxShadow: "0px 0px 22px rgba(239,68,68,0.15)",
            }}
          >
            <p
              className="text-xl font-semibold"
              style={{
                background: "linear-gradient(to right, #ff7a7a, #ff4b4b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Owe
            </p>
            <p className="kranky-regular text-4xl font-bold text-red-400 mt-4">
              ₹{Math.abs(totalGive).toFixed(2)}
            </p>
          </div>

          {/* Total Receive */}
          <div
            className="p-8 rounded-2xl w-full md:w-1/3 text-center border border-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            style={{
              backgroundColor: "rgba(10, 10, 11, 0.6)",
              boxShadow: "0px 0px 22px rgba(16,185,129,0.15)",
            }}
          >
            <p
              className="text-xl font-semibold"
              style={{
                background: "linear-gradient(to right, #77ffd9, #45ff8f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Receive
            </p>
            <p className="kranky-regular text-4xl font-bold text-emerald-400 mt-4">
              ₹{parseFloat(totalTake).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Desktop User List */}
        <ul className="space-y-3 py-2">
          {activeFriends.map(
            (friend, index) =>
              friend.isActive && (
                <li
                  key={friend.username}
                  className="rounded-2xl overflow-hidden border border-white/5 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
                >
                    <Link
                      to={`/transactions/${user?.username}--${friend.username}`}
                      className="flex items-center space-x-6 p-5 pr-8"
                    >
                      {/* Profile Picture */}
                      <div className="w-16 h-16 relative">
                        <img
                          src={
                            friend.profilePicture ||
                            "/user2.png" ||
                            "/placeholder.svg"
                           || "/placeholder.svg"}
                          alt={friend.username}
                          className="w-full h-full rounded-full object-cover border"
                          style={{
                            borderColor: friend.totalAmount < 0 ? "rgba(239,68,68,0.45)" : "rgba(16,185,129,0.45)",
                          }}
                        />
                      </div>

                      {/* User Info */}
                      <div className="merienda-regular flex-1">
                        <p className="text-lg font-semibold">
                          {friend.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatTimeAgo(friend.lastTransactionTime)}
                        </p>
                      </div>

                      {/* Balance */}
                      <div
                        className={`text-2xl kranky-regular font-bold ${
                          friend.totalAmount < 0 ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        ₹{Math.abs(friend.totalAmount).toFixed(2)}
                      </div>
                    </Link>
                  </li>
                ),
            )}
        </ul>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <Link
          to="/split-expense"
          className="flex items-center justify-center gap-2 text-white rounded-full p-4 border border-white/10 backdrop-blur-md"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(3,7,18,0.75) 100%)",
            boxShadow: "0 5px 20px rgba(59,130,246,0.35)",
          }}
        >
          <img
            src={split}
            className="w-6 h-6"
            alt="Split an expense"
          />
          <span className="pacifico-regular font-medium">
            Split an Expense
          </span>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
