"use client"

import { useEffect, useContext, useState } from "react"
import { Link } from "react-router-dom"
import UserContext from "../context/UserContext.js"
import { motion, AnimatePresence } from "framer-motion"
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
        console.log(friend.totalAmount)
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  // Enhanced hover animation
  const hoverScale = {
    scale: 1.03,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    transition: { duration: 0.3 },
  }

  return (
    <motion.div
      className="p-4 min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,0.06), rgba(0,0,0,0) 60%), radial-gradient(1000px 500px at 110% 10%, rgba(59,130,246,0.06), rgba(0,0,0,0) 55%), linear-gradient(180deg, #0a0a0b 0%, #050505 100%)",
      }}
    >
      {/* Header Section with Enhanced Animation */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 15,
          },
        }}
        className="merienda-regular flex items-center justify-center pb-3"
      >
        <Link to="/" className="px-3 py-1 rounded-2xl border border-white/5 bg-black/30 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <motion.span
            className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400"
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.45 }}
            whileHover={{
              scale: 1.04,
              textShadow: "0 0 14px rgba(16,185,129,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Hisaab <span className="text-white">Kitab</span>
          </motion.span>
        </Link>
      </motion.div>

      {/* Mobile Summary Section with Enhanced Animation */}
      <motion.div
        className="md:hidden p-4 px-0"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.1,
          },
        }}
      >
        <motion.div
          className="flex items-center justify-center rounded-2xl overflow-hidden backdrop-blur-md border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{
            backgroundColor: "rgba(8, 8, 9, 0.75)",
          }}
        >
          {/* Left Side - Total Owe with Enhanced Animation */}
          <motion.div
            className="flex-1 text-center py-4 px-3 transform transition-all duration-300 border-r border-white/5"
            style={{
              boxShadow: "inset 0px 0 12px -6px rgba(239,68,68,0.35)",
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(40, 18, 18, 0.4)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.p
              className="text-lg font-semibold lobster-regular"
              style={{
                background: "linear-gradient(to right, #ff7a7a, #ff4b4b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={{
                textShadow: "0 0 10px rgba(255,75,75,0.5)",
              }}
            >
              Pay Up!
            </motion.p>
            <motion.p
              className="text-2xl kranky-regular font-bold text-red-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              ₹{totalGive ? Math.abs(totalGive).toFixed(2) : "0.00"}
            </motion.p>
          </motion.div>

          {/* Right Side - Total Receive with Enhanced Animation */}
          <motion.div
            className="flex-1 text-center py-4 px-3 transform transition-all duration-300"
            style={{
              boxShadow: "inset 0px 0 12px -6px rgba(16,185,129,0.35)",
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(18, 40, 32, 0.4)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.p
              className="text-lg font-semibold lobster-regular"
              style={{
                background: "linear-gradient(to right, #77ffd9, #45ff8f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={{
                textShadow: "0 0 10px rgba(69,255,144,0.5)",
              }}
            >
              Cash Incoming!
            </motion.p>
            <motion.p
              className="text-2xl kranky-regular font-bold text-green-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              ₹{totalTake ? parseFloat(totalTake).toFixed(2) : "0.00"}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile User List with Enhanced Staggered Animation */}
      <motion.div className="block md:hidden" variants={containerVariants}>
        <motion.ul
          className="merienda-regular divide-y divide-white/5 rounded-2xl overflow-hidden backdrop-blur-md border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
          style={{
            backgroundColor: "rgba(10, 10, 11, 0.55)",
          }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
              when: "beforeChildren"
            }
          }}
        >
          <AnimatePresence>
            {activeFriends &&
              activeFriends.map(
                (friend, index) =>
                  friend.isActive && (
                    <motion.li
                      key={friend.username}
                      variants={itemVariants}
                      whileHover={{
                        backgroundColor: "rgba(18, 18, 19, 0.75)",
                        x: 5,
                        transition: { duration: 0.2 },
                      }}
                      exit={{ opacity: 0, x: -100 }}
                      custom={index}
                    >
                      <Link
                        to={`/transactions/${user?.username}--${friend.username}`}
                        className="flex items-center space-x-4 p-4"
                      >
                        {/* Profile Picture with Enhanced Animation */}
                        <motion.div
                          className="w-12 h-12 relative"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.9, rotate: -5 }}
                        >
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
                        </motion.div>

                        {/* User Info with Slide Animation */}
                        <motion.div
                          className="flex-1 overflow-hidden"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <motion.p
                            className="text-base font-semibold truncate"
                            whileHover={{
                              color: friend.totalAmount < 0 ? "#ff7a7a" : "#77ffd9",
                              transition: { duration: 0.2 },
                            }}
                          >
                            {friend.name}
                          </motion.p>
                          <p className="text-xs text-gray-400">{formatTimeAgo(friend.lastTransactionTime)}</p>
                        </motion.div>

                        {/* Balance with Enhanced Animation */}
                        <motion.div
                          className={`kranky-regular text-lg font-extrabold ${
                            friend.totalAmount < 0 ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          ₹{Math.abs(friend.totalAmount).toFixed(2)}
                        </motion.div>
                      </Link>
                    </motion.li>
                  ),
              )}
          </AnimatePresence>
        </motion.ul>
      </motion.div>

      {/* Desktop View with Enhanced Animations */}
      <div className="hidden md:block">
        {/* Summary Section with Floating Animation */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="my-8 flex flex-col md:flex-row items-stretch justify-around space-y-4 md:space-y-0 md:space-x-8"
        >
          {/* Total Owe with Enhanced Hover Effects */}
          <motion.div
            className="p-8 rounded-2xl w-full md:w-1/3 text-center transform transition-all duration-300 border border-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            style={{
              backgroundColor: "rgba(10, 10, 11, 0.6)",
              boxShadow: "0px 0px 22px rgba(239,68,68,0.15)",
            }}
            whileHover={{
              ...hoverScale,
              backgroundColor: "rgba(24, 12, 12, 0.65)",
              boxShadow: "0px 0px 34px rgba(239,68,68,0.25)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                textShadow: "0 0 10px rgba(255,75,75,0.5)",
              }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold"
              style={{
                background: "linear-gradient(to right, #ff7a7a, #ff4b4b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Owe
            </motion.p>
            <motion.p
              className="kranky-regular text-4xl font-bold text-red-400 mt-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                textShadow: "0 0 15px rgba(255,75,75,0.8)",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
                delay: 0.3,
              }}
              whileHover={{ scale: 1.1 }}
            >
              ₹{Math.abs(totalGive).toFixed(2)}
            </motion.p>
          </motion.div>

          {/* Total Receive with Enhanced Hover Effects */}
          <motion.div
            className="p-8 rounded-2xl w-full md:w-1/3 text-center transform transition-all duration-300 border border-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            style={{
              backgroundColor: "rgba(10, 10, 11, 0.6)",
              boxShadow: "0px 0px 22px rgba(16,185,129,0.15)",
            }}
            whileHover={{
              ...hoverScale,
              backgroundColor: "rgba(12, 24, 18, 0.65)",
              boxShadow: "0px 0px 34px rgba(16,185,129,0.25)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                textShadow: "0 0 10px rgba(69,255,144,0.5)",
              }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold"
              style={{
                background: "linear-gradient(to right, #77ffd9, #45ff8f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Receive
            </motion.p>
            <motion.p
              className="kranky-regular text-4xl font-bold text-emerald-400 mt-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                textShadow: "0 0 15px rgba(69,255,144,0.8)",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
                delay: 0.3,
              }}
              whileHover={{ scale: 1.1 }}
            >
              ₹{parseFloat(totalTake).toFixed(2)}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Desktop User List with Enhanced Staggered Animation */}
        <motion.ul className="space-y-3 py-2" variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {activeFriends.map(
              (friend, index) =>
                friend.isActive && (
                  <motion.li
                    key={friend.username}
                    variants={itemVariants}
                    custom={index}
                    className="rounded-2xl overflow-hidden border border-white/5 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
                    whileHover={{
                      backgroundColor: "rgba(14, 14, 15, 0.75)",
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.98, x: 0 }}
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                  >
                    <Link
                      to={`/transactions/${user?.username}--${friend.username}`}
                      className="flex items-center space-x-6 p-5 pr-8"
                    >
                      {/* Profile Picture with Enhanced Effects */}
                      <motion.div
                        className="w-16 h-16 relative"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9, rotate: -5 }}
                      >
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
                      </motion.div>

                      {/* User Info with Enhanced Animation */}
                      <motion.div
                        className="merienda-regular flex-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                      >
                        <motion.p
                          className="text-lg font-semibold"
                          whileHover={{
                            color: friend.totalAmount < 0 ? "#ff7a7a" : "#77ffd9",
                            x: 3,
                            transition: { duration: 0.2 },
                          }}
                        >
                          {friend.name}
                        </motion.p>
                        <motion.p className="text-sm text-gray-400" whileHover={{ opacity: 0.8, x: 3 }}>
                          {formatTimeAgo(friend.lastTransactionTime)}
                        </motion.p>
                      </motion.div>

                      {/* Balance with Enhanced Animation */}
                      <motion.div
                        className={`text-2xl kranky-regular font-bold ${
                          friend.totalAmount < 0 ? "text-red-400" : "text-emerald-400"
                        }`}
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          rotate: 0,
                          textShadow: friend.totalAmount < 0 
                            ? "0 0 10px rgba(239,68,68,0.6)" 
                            : "0 0 10px rgba(16,185,129,0.6)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                          delay: 0.2 + index * 0.05,
                        }}
                        whileHover={{
                          scale: 1.2,
                          rotate: friend.totalAmount < 0 ? -5 : 5,
                          textShadow: friend.totalAmount < 0 
                            ? "0 0 15px rgba(239,68,68,0.8)" 
                            : "0 0 15px rgba(16,185,129,0.8)",
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ₹{Math.abs(friend.totalAmount).toFixed(2)}
                      </motion.div>
                    </Link>
                  </motion.li>
                ),
            )}
          </AnimatePresence>
        </motion.ul>
      </div>

      {/* Mobile Floating Action Button with Enhanced Animation */}
      <motion.div
        className="md:hidden fixed bottom-4 right-4 z-10"
        // initial={{ y: 100, opacity: 0 }}
        // animate={{ y: 0, opacity: 1 }}
        // transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 10px 25px rgba(59, 130, 246, 0.7)",
        }}
        whileTap={{ scale: 0.9 }}
      >
        <Link
          to="/split-expense"
          className="flex items-center justify-center gap-2 text-white rounded-full p-4 border border-white/10 backdrop-blur-md"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(3,7,18,0.75) 100%)",
            boxShadow: "0 5px 20px rgba(59,130,246,0.35)",
          }}
        >
          <motion.img
            src={split}
            className="w-6 h-6"
            alt="Split an expense"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 10 }}
          />
          <motion.span
            className="pacifico-regular font-medium"
            whileHover={{
              color: "#a5f3fc",
            }}
          >
            Split an Expense
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard
