"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { useParams } from "react-router-dom"
import { Send, ArrowLeftRight, ChevronUp, ChevronDown } from "lucide-react"
import UserContext from "../context/UserContext.js"
import socket from "../socket.js"

// Import the TransactionCard component
import TransactionCard from "./TransactionCard"
import TransactionModal from "./TransactionModel"

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

  useEffect(() => {
    // Show buttons with a slight delay for a nice entrance effect
    const timer = setTimeout(() => {
      setButtonsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    socket.on("newTransaction", (newTransaction) => {
      setTransactions((prevTransactions) => [...prevTransactions, newTransaction])
      setFriendTransactions((prevTransactions) => [...prevTransactions, newTransaction])
    })

    socket.on("acceptTransaction", (_id) => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id ? { ...transaction, status: "completed" } : transaction,
        ),
      )
      setFriendTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id ? { ...transaction, status: "completed" } : transaction,
        ),
      )
    })

    socket.on("rejectTransaction", (_id) => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id ? { ...transaction, status: "rejected" } : transaction,
        ),
      )
      setFriendTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id ? { ...transaction, status: "rejected" } : transaction,
        ),
      )
    })

    socket.on("cancelTransaction", (_id) => {
      setTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction._id !== _id))
      setFriendTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction._id !== _id))
    })

    return () => {
      socket.off("newTransaction")
      socket.off("acceptTransaction")
      socket.off("rejectTransaction")
      socket.off("cancelTransaction")
    }
  }, [])

  useEffect(() => {
    if (user) {
      const friendMain = activeFriends.find((friend) => friend.username === friendId)
      if (!friendMain) {
        window.history.pushState({}, "", "/dashboard")
        window.dispatchEvent(new PopStateEvent("popstate"))
      }
      if (userUsername !== user.username) {
        window.history.pushState({}, "", "/transactions/" + user.username + "--" + friendId)
        window.dispatchEvent(new PopStateEvent("popstate"))
      }
    }
  })

  const handleButtonClick = (type) => {
    setTransactionType(type)
    setIsModalOpen(true)
  }

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

    setFriendTransactions(() => {
      const friendTransactions = transactions?.filter(
        (transaction) =>
          (transaction.sender === user?._id && transaction.receiver === friendMain?._id) ||
          (transaction.receiver === user?._id && transaction.sender === friendMain?._id),
      )

      return friendTransactions?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    })

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

  useEffect(() => {
    let accumulatedTotal = 0

    for (const transaction of friendTransactions) {
      if (transaction.status === "completed") {
        if (transaction.sender === user?._id) {
          accumulatedTotal += transaction.amount // Amount to totalGive
        } else {
          accumulatedTotal -= transaction.amount // Amount to totalTake
        }
      }
    }

    setActiveFriends((prevActiveFriends) => {
      const updatedActiveFriends = prevActiveFriends?.map((friend) => {
        if (friend.username === friendId) {
          return {
            ...friend,
            totalAmount: accumulatedTotal,
          }
        }
        return friend
      })
      return updatedActiveFriends
    })

    setTotal(() => accumulatedTotal)
  }, [userUsername, friendTransactions, setFriendTransactions])

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(transaction)
      return groups
    }, {})
  }

  const groupedTransactions = groupTransactionsByDate(friendTransactions)

  useEffect(() => {
    if (lastTransactionRef.current) {
      lastTransactionRef.current.scrollIntoView({
        block: "end",
      })
    }
  }, [friendTransactions])

  // Function to generate initials for the profile picture
  const getInitials = (name) => {
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Enhanced header design */}
      <div className="bg-gradient-to-r from-[#161b22] to-[#1a2030] shadow-lg p-3 pl-12 flex items-center justify-between w-full border-b border-cyan-500/30 fixed top-0 left-0 right-0 z-10">
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
      <div className="flex-1 pt-20 pb-24 mx-auto w-full p-3 space-y-4 bg-[#0d1117] overflow-y-auto">
        {friendTransactions?.length > 0 ? (
          <div className="space-y-4 fade-in">
            {Object.keys(groupedTransactions)
              .sort((a, b) => new Date(b) - new Date(a))
              .map((date) => (
                <div key={date}>
                  <div className="flex justify-center my-3">
                    <div className="px-3 py-1 rounded-full bg-[#1a2030] text-gray-400 text-xs border border-gray-800/50 shadow-sm">
                      {new Date(date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {groupedTransactions[date]?.map((transaction, index) => (
                      <div
                        ref={index === groupedTransactions[date].length - 1 ? lastTransactionRef : null}
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
          <div className="flex flex-col items-center justify-center h-[60vh] text-center fade-in">
            <div className="bg-[#1a2030] p-6 rounded-xl border border-cyan-500/20 shadow-md">
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

