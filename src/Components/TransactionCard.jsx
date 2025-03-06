"use client"

import { useState, useContext, useEffect } from "react"
import { toast } from "react-toastify"
import UserContext from "../context/UserContext.js"
import socket from "../socket.js"
import rejectedIcon from "../assets/icons/rejected.png"

// Custom hook for transaction actions
const useTransactionActions = (
  transaction,
  userId,
  setTransactions,
  setFriendTransactions,
  friendUsername,
  fcmToken,
  accessToken,
  refreshToken,
) => {
  const { _id, sender, amount } = transaction
  const [loading, setLoading] = useState({ accept: false, reject: false, cancel: false })

  const updateTransactionStatus = (newStatus) => {
    const updateFunction = (prevTransactions) =>
      prevTransactions.map((prevTransaction) =>
        prevTransaction._id === _id ? { ...prevTransaction, status: newStatus } : prevTransaction,
      )

    setTransactions(updateFunction)
    setFriendTransactions(updateFunction)
  }

  const handleApiError = (error, message = "An error occurred") => {
    console.error(error)
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "dark",
    })
  }

  const apiRequest = async (endpoint, actionType, onSuccess) => {
    setLoading((prev) => ({ ...prev, [actionType]: true }))

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${_id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken, refreshToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        handleApiError(data, data.message)
        return
      }

      onSuccess()
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading((prev) => ({ ...prev, [actionType]: false }))
    }
  }

  const handleAccept = () =>
    apiRequest("accept", "accept", () => {
      socket.emit("acceptTransaction", { _id, friendUsername, fcmToken, transactionAmount: amount })
      updateTransactionStatus("completed")
    })

  const handleReject = () =>
    apiRequest("deny", "reject", () => {
      socket.emit("rejectTransaction", { _id, friendUsername, fcmToken, transactionAmount: amount })
      updateTransactionStatus("rejected")
    })

  const handleCancel = () =>
    apiRequest("cancel", "cancel", () => {
      socket.emit("cancelTransaction", { _id, friendUsername })

      const element = document.getElementById(`transaction-${_id}`)
      if (element) {
        element.style.opacity = "0"
        element.style.transform = "scale(0.9) translateY(10px)"

        setTimeout(() => {
          setTransactions((prev) => prev.filter((t) => t._id !== _id))
          setFriendTransactions((prev) => prev.filter((t) => t._id !== _id))
        }, 300)
      } else {
        setTransactions((prev) => prev.filter((t) => t._id !== _id))
        setFriendTransactions((prev) => prev.filter((t) => t._id !== _id))
      }
    })

  return { loading, handleAccept, handleReject, handleCancel }
}

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 mr-1.5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"></path>
  </svg>
)

const StatusIndicator = ({ status, isSender }) => (
  <div
    className={`h-2 w-2 rounded-full ${
      status === "completed"
        ? "bg-green-400 animate-pulse"
        : status === "rejected"
          ? "bg-red-500"
          : isSender
            ? "bg-cyan-400 animate-pulse"
            : "bg-pink-400 animate-pulse"
    }`}
  ></div>
)

const ActionButton = ({ onClick, disabled, loading, color, hoverColor, children }) => (
  <button
    onClick={onClick}
    className={`bg-${color}-500 hover:bg-${hoverColor}-600 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-${color}-400 focus:ring-opacity-50 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
    disabled={disabled}
  >
    {loading ? <LoadingSpinner /> : children}
  </button>
)

const ActionButtons = ({ isSender, loading, handleAccept, handleReject, handleCancel }) => (
  <div className={`flex space-x-2 mt-3 ${isSender ? "justify-end" : "justify-start"}`}>
    {isSender ? (
      <ActionButton
        onClick={handleCancel}
        disabled={loading.cancel}
        loading={loading.cancel}
        color="yellow"
        hoverColor="yellow"
      >
        Cancel
      </ActionButton>
    ) : (
      <>
        <ActionButton
          onClick={handleAccept}
          disabled={loading.accept}
          loading={loading.accept}
          color="green"
          hoverColor="green"
        >
          Accept
        </ActionButton>
        <ActionButton
          onClick={handleReject}
          disabled={loading.reject}
          loading={loading.reject}
          color="red"
          hoverColor="red"
        >
          Reject
        </ActionButton>
      </>
    )}
  </div>
)

const DateSeparator = ({ date }) => (
  <div className="flex justify-center my-4">
    <div className="px-4 py-1 rounded-full bg-gray-800/50 text-gray-400 text-sm">
      {new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </div>
  </div>
)

const TransactionCard = ({ transaction, userId, setFriendTransactions, friendUsername, fcmToken, showDate }) => {
  const { createdAt, amount, description, status, _id, sender } = transaction
  const { setTransactions, accessToken, refreshToken } = useContext(UserContext)
  const isSender = sender === userId

  const { loading, handleAccept, handleReject, handleCancel } = useTransactionActions(
    transaction,
    userId,
    setTransactions,
    setFriendTransactions,
    friendUsername,
    fcmToken,
    accessToken,
    refreshToken,
  )

  useEffect(() => {
    const element = document.getElementById(`transaction-${_id}`)
    if (element) {
      element.style.opacity = "0"
      element.style.transform = isSender ? "translateX(20px)" : "translateX(-20px)"

      setTimeout(() => {
        element.style.opacity = "1"
        element.style.transform = "translateX(0)"
      }, 10)
    }
  }, [_id, isSender])

  const getAmountColor = () => {
    if (status === "rejected") return "text-gray-400 line-through"
    const isPositive = (isSender && amount > 0) || (!isSender && amount < 0)
    return isPositive ? "text-green-400" : "text-red-400"
  }

  const getCardBackground = () => {
    const baseColor = "bg-[#0d1117]"
    const borderColor =
      (isSender && amount > 0) || (!isSender && amount < 0) ? "border-green-500/30" : "border-red-500/30"

    if (status === "completed") return `${baseColor} border-2 border-green-500/30`
    if (status === "rejected") return `${baseColor} border-2 border-red-500/30 opacity-80`
    return `${baseColor} border border-[1px] ${borderColor}`
  }

  return (
    <>
      {showDate && <DateSeparator date={createdAt} />}
      <div
        id={`transaction-${_id}`}
        className={`w-full px-4 py-2 flex ${isSender ? "justify-end" : "justify-start"} transition-all duration-300`}
      >
        <div
          className={`relative p-3 rounded-2xl shadow-lg min-w-[180px] max-w-[250px] 
            transition-all duration-300 transform ${getCardBackground()}
            ${isSender ? "rounded-tr-sm" : "rounded-tl-sm"}
            ${status === "pending" ? "hover:shadow-lg hover:shadow-cyan-500/10" : ""}`}
        >
          <div className={`flex items-center justify-between mb-2`}>
            <StatusIndicator status={status} isSender={isSender} />
            <span className="text-gray-400 text-sm">
              {new Date(createdAt)
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .toLowerCase()}
            </span>
          </div>

          <div
            className={`text-3xl fredericka-the-great-regular mb-1 ${isSender ? "text-right" : "text-left"} ${getAmountColor()} 
            transition-all duration-300 transform ${status === "completed" ? "scale-105" : ""}`}
          >
            ₹{Math.abs(amount)}
          </div>

          {description && (
            <div
              className={`text-sm text-gray-400 ${
                isSender ? "text-right" : "text-left"
              } transition-all duration-300 mb-2`}
            >
              {description}
            </div>
          )}

          {status === "rejected" && (
            <img
              src={rejectedIcon || "/placeholder.svg"}
              alt="Rejected"
              className={`absolute top-2 ${isSender ? "right-16" : "left-16"} w-8 h-8 animate-bounce-once opacity-80`}
              style={{
                animation: "bounce 0.5s ease 1",
              }}
            />
          )}

          {status === "pending" && (
            <ActionButtons
              isSender={isSender}
              loading={loading}
              handleAccept={handleAccept}
              handleReject={handleReject}
              handleCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </>
  )
}

const injectStyles = () => {
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
  `
  document.head.appendChild(style)
}

injectStyles()

export default TransactionCard

