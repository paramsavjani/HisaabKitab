"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { useParams } from "react-router-dom"
import { Send, ArrowLeftRight, ChevronUp, ChevronDown } from "lucide-react"
import UserContext from "../context/UserContext.js"
import socket from "../socket.js"

// Import the TransactionCard component
import TransactionCard from "./TransactionCard"
import TransactionModal from "./TransactionModel"

// Helper function to safely parse and format date
const parseDate = (dateString) => {
  if (!dateString) return null

  try {
    // Try different date formats
    let date

    // Try as ISO string
    date = new Date(dateString)
    if (!isNaN(date.getTime())) return date

    // Try as timestamp
    if (typeof dateString === "number" || /^\d+$/.test(dateString)) {
      date = new Date(Number.parseInt(dateString))
      if (!isNaN(date.getTime())) return date
    }

    // Try with manual parsing for different formats
    const formats = [
      // MM/DD/YYYY
      (str) => {
        const parts = str.split("/")
        return parts.length === 3 ? new Date(parts[2], parts[0] - 1, parts[1]) : null
      },
      // DD/MM/YYYY
      (str) => {
        const parts = str.split("/")
        return parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : null
      },
      // YYYY-MM-DD
      (str) => {
        const parts = str.split("-")
        return parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : null
      },
    ]

    for (const format of formats) {
      const parsedDate = format(dateString)
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    // If all parsing attempts fail
    console.warn(`Could not parse date: ${dateString}`)
    return null
  } catch (error) {
    console.error("Date parsing error:", error, "for date:", dateString)
    return null
  }
}

// Helper function to format time
const formatTime = (date) => {
  if (!date) return "Unknown Time"

  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  } catch (error) {
    console.error("Time formatting error:", error)
    return "Unknown Time"
  }
}

export default function Transactions() {
  const { chatId } = useParams()
  const [total, setTotal] = useState(null)
  const [friend, setFriend] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState(null) // 'give' or 'get'
  const userUsername = chatId?.split("--")[0]
  const friendId = chatId?.split("--")[1]
  const lastTransactionRef = useRef(null)
  const [friendTransactions, setFriendTransactions] = useState([])
  const [buttonsVisible, setButtonsVisible] = useState(false)
  const { user, activeFriends, setActiveFriends, transactions, setTransactions } = useContext(UserContext)

  // Socket connection and button visibility setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true)
    }, 300)

    const handleNewTransaction = (newTransaction) => {
      setTransactions((prev) => {
        // Check if transaction already exists
        if (prev.some((t) => t._id === newTransaction._id)) return prev
        return [...prev, newTransaction]
      })
    }

    socket.on("newTransaction", handleNewTransaction)

    const handleStatusUpdate = (_id, status) => {
      setTransactions((prev) =>
        prev.map((transaction) => (transaction._id === _id ? { ...transaction, status } : transaction)),
      )
    }

    socket.on("acceptTransaction", (_id) => handleStatusUpdate(_id, "completed"))
    socket.on("rejectTransaction", (_id) => handleStatusUpdate(_id, "rejected"))
    socket.on("cancelTransaction", (_id) => {
      setTransactions((prev) => prev.filter((transaction) => transaction._id !== _id))
    })

    return () => {
      clearTimeout(timer)
      socket.off("newTransaction", handleNewTransaction)
      socket.off("acceptTransaction")
      socket.off("rejectTransaction")
      socket.off("cancelTransaction")
    }
  }, [])

  // Process transactions when they change
  useEffect(() => {
    if (!user || !transactions || !friendId || !activeFriends) return

    const friendMain = activeFriends.find((friend) => friend.username === friendId)
    if (!friendMain) return

    // Filter transactions for this friend
    const filteredTransactions = transactions.filter(
      (transaction) =>
        (transaction.sender === user._id && transaction.receiver === friendMain._id) ||
        (transaction.receiver === user._id && transaction.sender === friendMain._id),
    )

    // Process and enhance transactions with formatted dates
    const processedTransactions = filteredTransactions.map((transaction) => {
      const parsedDate = parseDate(transaction.createdAt)
      return {
        ...transaction,
        parsedDate,
        formattedTime: parsedDate ? formatTime(parsedDate) : "Unknown Time",
      }
    })

    // Sort transactions by date (newest first)
    const sortedTransactions = processedTransactions.sort((a, b) => {
      if (!a.parsedDate && !b.parsedDate) return 0
      if (!a.parsedDate) return 1
      if (!b.parsedDate) return -1
      return b.parsedDate.getTime() - a.parsedDate.getTime()
    })

    setFriendTransactions(sortedTransactions)
  }, [transactions, friendId, user, activeFriends, friendId])

  const handleButtonClick = (type) => {
    setTransactionType(type)
    setIsModalOpen(true)
  }

  // Initial setup
  useEffect(() => {
    document.title = "Transactions"
    if (!user) {
      window.location.replace("/login")
      return
    }
    if (user?.username !== userUsername) {
      window.location.replace("/transactions/" + user.username + "--" + friendId)
      return
    }

    const friendMain = activeFriends.find((friend) => friend.username === friendId)
    setFriend(() => friendMain)

    setActiveFriends((prevActiveFriends) => {
      const updatedActiveFriends = prevActiveFriends?.map((friend) => {
        if (friend.username === friendId) {
          return {
            ...friend,
            isActive: true,
          }
        }
        return friend
      })
      return updatedActiveFriends
    })
  }, [friendId, userUsername])

  // Calculate total balance
  useEffect(() => {
    if (!user?._id || !friendTransactions.length) return

    let accumulatedTotal = 0

    for (const transaction of friendTransactions) {
      if (transaction.status === "completed") {
        if (transaction.sender === user._id) {
          accumulatedTotal += transaction.amount
        } else {
          accumulatedTotal -= transaction.amount
        }
      }
    }

    setTotal(accumulatedTotal)

    setActiveFriends((prev) => {
      if (!prev) return prev
      return prev.map((friend) => {
        if (friend.username === friendId) {
          return {
            ...friend,
            totalAmount: accumulatedTotal,
          }
        }
        return friend
      })
    })
  }, [friendTransactions, user?._id, friendId])

  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const groups = transactions.reduce((groups, transaction) => {
      const date = transaction.parsedDate

      if (!date) return groups

      const dateKey = date.toISOString().split("T")[0]
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(transaction)

      return groups
    }, {})

    // Sort transactions within each group (oldest first)
    Object.keys(groups).forEach((dateKey) => {
      groups[dateKey].sort((a, b) => {
        if (!a.parsedDate && !b.parsedDate) return 0
        if (!a.parsedDate) return 1
        if (!b.parsedDate) return -1
        return a.parsedDate.getTime() - b.parsedDate.getTime() // Oldest first
      })
    })

    return groups
  }

  // Scroll to latest transaction
  useEffect(() => {
    if (friendTransactions.length === 0) return

    // Scroll to the bottom of the container on initial load
    const transactionsContainer = document.getElementById("transactions-container")
    if (transactionsContainer) {
      setTimeout(() => {
        transactionsContainer.scrollTop = transactionsContainer.scrollHeight
      }, 100)
    }
  }, [friendTransactions])

  // Function to generate initials for the profile picture
  const getInitials = (name) => {
    if (!name) return "FR"
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Format balance to always show 2 decimal places
  const formatBalance = (value) => {
    const numValue = Number(value || 0)
    return Math.abs(numValue).toFixed(2)
  }

  // Get balance status message
  const getBalanceStatus = (total) => {
    if (total > 0) {
      return "You'll receive"
    } else if (total < 0) {
      return "You owe"
    } else {
      return "All settled"
    }
  }

  // Get balance icon
  const getBalanceIcon = (total) => {
    if (total > 0) {
      return <ChevronUp className="h-3 w-3" />
    } else if (total < 0) {
      return <ChevronDown className="h-3 w-3" />
    }
    return null
  }

  // Inject styles for animations and transitions
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInRight {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .slide-in-up {
        animation: slideInUp 0.5s ease forwards;
      }
      
      .slide-in-right {
        animation: slideInRight 0.5s ease forwards;
      }
      
      .fade-in {
        animation: fadeIn 0.5s ease forwards;
      }
      
      .fredericka-the-great-regular {
        font-family: 'Fredericka the Great', cursive;
      }
      
      .merienda-regular {
        font-family: 'Merienda', cursive;
      }
      
      .kranky-regular {
        font-family: 'Kranky', cursive;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Format date for display
  const formatDateForDisplay = (dateKey) => {
    if (dateKey === "Invalid Date") return "Unknown Date"

    try {
      // Parse the date key (YYYY-MM-DD)
      const date = new Date(dateKey)

      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date for display:", error)
      return dateKey
    }
  }

  // Get grouped and sorted transactions
  const groupedTransactions = groupTransactionsByDate(friendTransactions)

  // Sort date keys (newest first)
  const sortedDateKeys = Object.keys(groupedTransactions).sort((a, b) => {
    if (a === "Invalid Date") return 1
    if (b === "Invalid Date") return -1

    // Compare dates (oldest first)
    return new Date(a) - new Date(b)
  })

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Enhanced header design */}
      <div className="bg-gradient-to-r from-[#161b22] to-[#1a2030] shadow-lg p-3 flex items-center justify-between w-full border-b border-cyan-500/30 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-3">
          {friend?.profilePicture ? (
            <img
              src={friend.profilePicture || "/placeholder.svg"}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-cyan-500/70 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {getInitials(friend?.name || "Friend")}
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold text-white">{friend?.name || "Friend"}</h1>
            <p className="text-xs text-cyan-300/70">@{friend?.username}</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1 text-xs text-gray-300">
            <span>{getBalanceStatus(total ? total : friend?.totalAmount)}</span>
            {getBalanceIcon(total ? total : friend?.totalAmount)}
          </div>
          <p
            className={`text-base font-bold flex items-center ${
              (total ? total : friend?.totalAmount) < 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            <span className="text-xs mr-0.5">₹</span>
            {formatBalance(total ? total : friend?.totalAmount)}
          </p>
        </div>
      </div>

      {/* Transactions Section - Mobile Optimized */}
      <div
        id="transactions-container"
        className="flex-1 pt-20 pb-24 mx-auto w-full p-3 space-y-4 bg-[#0d1117] overflow-y-auto"
      >
        {friendTransactions?.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                <div className="flex justify-center my-3">
                  <div className="px-3 py-1 rounded-full bg-[#1a2030] text-gray-400 text-xs border border-gray-800/50 shadow-sm">
                    {formatDateForDisplay(dateKey)}
                  </div>
                </div>

                <div className="space-y-2">
                  {groupedTransactions[dateKey].map((transaction, index) => (
                    <div
                      ref={
                        index === groupedTransactions[dateKey].length - 1 &&
                        dateKey === sortedDateKeys[sortedDateKeys.length - 1]
                          ? lastTransactionRef
                          : null
                      }
                      key={transaction._id}
                    >
                      <TransactionCard
                        transaction={transaction}
                        userId={user?._id}
                        setFriendTransactions={setFriendTransactions}
                        friendUsername={friendId}
                        fcmToken={friend?.fcmToken}
                        friendId={friend?._id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
            <div className="bg-[#161b22] p-6 rounded-xl border border-cyan-500/20 shadow-md">
              <ArrowLeftRight className="h-16 w-16 text-cyan-500 mb-4 mx-auto" />
              <h3 className="text-lg font-medium text-white mb-2">No transactions yet</h3>
              <p className="text-sm text-gray-400 mb-4">
                Start by creating your first transaction with {friend?.name || "your friend"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Side by side beautiful buttons with entrance animation */}
      <div
        className={`fixed bottom-6 right-6 flex space-x-4 ${buttonsVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      >
        <button
          onClick={() => handleButtonClick("give")}
          className={`bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none flex items-center justify-center ${buttonsVisible ? "slide-in-right" : ""}`}
          style={{ animationDelay: "0.1s" }}
          aria-label="You Gave"
        >
          <div className="relative">
            <Send className="h-6 w-6 transform rotate-180" />
            <div className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-red-600 shadow-sm">
              ₹
            </div>
          </div>
        </button>

        <button
          onClick={() => handleButtonClick("get")}
          className={`bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none flex items-center justify-center ${buttonsVisible ? "slide-in-right" : ""}`}
          style={{ animationDelay: "0.2s" }}
          aria-label="You Got"
        >
          <div className="relative">
            <Send className="h-6 w-6" />
            <div className="absolute -top-2 -right-2 bg-white text-green-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-green-600 shadow-sm">
              ₹
            </div>
          </div>
        </button>
      </div>

      {isModalOpen && (
        <TransactionModal
          transactionType={transactionType}
          setIsModalOpen={setIsModalOpen}
          setFriendTransactions={setFriendTransactions}
          friend={friend}
          setTransactions={setTransactions}
          setActiveFriends={setActiveFriends}
        />
      )}
    </div>
  )
}

