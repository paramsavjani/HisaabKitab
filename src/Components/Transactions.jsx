"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { useParams } from "react-router-dom"
import { Send, DollarSign } from "lucide-react"
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

  const { user, activeFriends, setActiveFriends, transactions, setTransactions } = useContext(UserContext)

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

  // Format balance to always show 2 decimal places
  const formatBalance = (value) => {
    const numValue = Number(value || 0)
    return Math.abs(numValue).toFixed(2)
  }

  // Inject styles for animations and transitions
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .scale-105 {
        transform: scale(1.05);
      }
      
      .scale-95 {
        transform: scale(0.95);
      }
      
      .animate-bounce-once {
        animation: bounce 0.5s ease 1;
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
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
      {/* Simple Profile Section - Keeping existing navbar */}
      <div className="pl-14 merienda-regular bg-[#161b22] shadow-lg p-3 flex items-center justify-between w-full border-b border-cyan-500/20 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <img
            src={friend?.profilePicture ? `${friend?.profilePicture}` : "/placeholder.svg?height=40&width=40"}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-cyan-500/30"
          />
          <div>
            <h1 className="text-lg font-medium">{friend?.name || "Friend"}</h1>
            <p className="text-xs text-gray-400">@{friend?.username}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="text-right">
            <p className="text-xs text-gray-400">Balance</p>
            <p
              className={`kranky-regular text-lg font-bold ${
                (total ? total : friend?.totalAmount) < 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              ₹{formatBalance(total ? total : friend?.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Section - Mobile Optimized */}
      <div className="flex-1 pt-4 mx-auto w-full p-3 space-y-4 bg-[#0d1117] overflow-y-auto">
        {friendTransactions?.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            {Object.keys(groupedTransactions)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <div key={date}>
                  {/* Date Separator - Compact for mobile */}
                  <div className="flex justify-center my-3">
                    <div className="px-3 py-1 rounded-full bg-[#161b22] text-gray-400 text-xs border border-gray-800/50 shadow-sm">
                      {new Date(groupedTransactions[date][0].createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="space-y-0">
                    {groupedTransactions[date]?.map((transaction, index) => (
                      <div
                        ref={index === groupedTransactions[date].length - 1 ? lastTransactionRef : null}
                        className={`${index === groupedTransactions[date].length - 1 ? "pb-24" : ""}`}
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
            <div className="bg-[#161b22] p-5 rounded-xl border border-cyan-500/20 shadow-md">
              <DollarSign className="h-12 w-12 text-gray-400 mb-3 mx-auto" />
              <h3 className="text-base font-medium text-white mb-1">No transactions yet</h3>
              <p className="text-xs text-gray-400 mb-3">Start by creating your first transaction</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button Bar - Simplified for mobile */}
      <div className="fixed bottom-0 w-full bg-[#161b22] p-3 flex space-x-3 border-t border-cyan-500/20 shadow-lg">
        <button
          onClick={() => handleButtonClick("give")}
          className="bg-red-500 text-white px-3 py-2.5 rounded-lg flex-1 shadow-md transition-all duration-200 transform active:scale-95 focus:outline-none text-sm font-medium"
        >
          <div className="flex items-center justify-center">
            <Send className="h-4 w-4 mr-1.5 transform rotate-180" />
            <span>You Gave</span>
          </div>
        </button>

        <button
          onClick={() => handleButtonClick("get")}
          className="bg-green-500 text-white px-3 py-2.5 rounded-lg flex-1 shadow-md transition-all duration-200 transform active:scale-95 focus:outline-none text-sm font-medium"
        >
          <div className="flex items-center justify-center">
            <Send className="h-4 w-4 mr-1.5" />
            <span>You Got</span>
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

