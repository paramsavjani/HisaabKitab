import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import "./styles.css";
import UserContext from "../context/UserContext.js";
import socket from "../socket.js";

const TransactionCard = ({
  transaction,
  userId,
  setFriendTransactions,
  friendUsername,
  fcmToken,
}) => {
  const { createdAt, amount, description, status, _id, sender } = transaction;
  const { setTransactions, accessToken, refreshToken } =
    useContext(UserContext);
  const isSender = sender === userId;

  // Loading states for buttons
  const [loading, setLoading] = useState({
    accept: false,
    reject: false,
    cancel: false,
  });

  // Handlers with loading logic
  const handleAccept = async () => {
    setLoading((prev) => ({ ...prev, accept: true }));
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${_id}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ accessToken, refreshToken }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "colored",
        });
        return;
      }
      const transactionAmount = transaction.amount;

      socket.emit("acceptTransaction", {
        _id,
        friendUsername,
        fcmToken,
        transactionAmount,
      });
      setFriendTransactions((prevTransactions) =>
        prevTransactions.map((prevTransaction) => {
          if (prevTransaction._id === _id) {
            return {
              ...prevTransaction,
              status: "completed",
            };
          }
          return prevTransaction;
        })
      );
      setTransactions((prevTransactions) =>
        prevTransactions.map((prevTransaction) => {
          if (prevTransaction._id === _id) {
            return {
              ...prevTransaction,
              status: "completed",
            };
          }
          return prevTransaction;
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, accept: false }));
    }
  };

  const handleReject = async () => {
    setLoading((prev) => ({ ...prev, reject: true }));
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${_id}/deny`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ accessToken, refreshToken }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "colored",
        });
        return;
      }

      const transactionAmount = transaction.amount;

      socket.emit("rejectTransaction", {
        _id,
        friendUsername,
        fcmToken,
        transactionAmount,
      });

      setTransactions((prevTransactions) =>
        prevTransactions.map((prevTransaction) => {
          if (prevTransaction._id === _id) {
            return {
              ...prevTransaction,
              status: "rejected",
            };
          }
          return prevTransaction;
        })
      );
      setFriendTransactions((prevTransactions) =>
        prevTransactions.map((prevTransaction) => {
          if (prevTransaction._id === _id) {
            return {
              ...prevTransaction,
              status: "rejected",
            };
          }
          return prevTransaction;
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, reject: false }));
    }
  };

  const handleCancel = async () => {
    setLoading((prev) => ({ ...prev, cancel: true }));
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ accessToken, refreshToken }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "colored",
        });
        return;
      }
      socket.emit("cancelTransaction", { _id, friendUsername });
      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t._id !== _id)
      );
      setFriendTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t._id !== _id)
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading((prev) => ({ ...prev, cancel: false }));
    }
  };

  return (
    <div
      className={`w-full px-2 py-2 flex ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`group relative p-4 pb-8 ${
          status === "rejected" ? "pb-4" : ""
        } rounded-xl shadow-lg backdrop-blur-sm border min-w-[180px] max-w-[85vw] ${
          isSender 
            ? "bg-gray-800/80 border-gray-700/50" 
            : "bg-gray-900/80 border-gray-600/50"
        } transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
        style={{
          backgroundColor: isSender 
            ? "rgba(30, 30, 30, 0.8)" 
            : "rgba(20, 20, 20, 0.8)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >

        {/* Status Badge */}
        {status === "completed" && (
          <div className={`absolute top-2 ${isSender ? "left-2" : "right-2"} bg-green-500 text-white text-xs font-extrabold px-2 py-1 rounded-full`}>
            ✔
          </div>
        )}

        {/* Amount Display */}
        <div
          className={`text-2xl font-bold mb-3 ${
            status === "rejected" ? "mb-0" : ""
          } ${isSender ? "text-right" : "text-left"} ${
            (isSender && transaction.amount > 0) ||
            (!isSender && transaction.amount < 0)
              ? "text-green-400"
              : "text-red-400"
          } ${status === "rejected" ? "line-through text-gray-300" : ""} drop-shadow-lg`}
        >
          ₹{Math.abs(amount)}
        </div>

        {/* Description Section */}
        {description && (
          <div
            className={`text-sm text-gray-200 break-words ${
              isSender ? "text-right pl-2" : "text-left pr-2"
            } leading-relaxed italic`}
          >
            {description}
          </div>
        )}

        {/* Rejected Status */}
        {status === "rejected" && (
          <div className={`absolute top-2 ${isSender ? "left-2" : "right-2"} bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold`}>
            ✗
          </div>
        )}

        {/* Action Buttons */}
        {status === "pending" && (
          <div
            className={`flex space-x-1 mt-3 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {isSender ? (
              <button
                onClick={handleCancel}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 w-full rounded-xl text-sm font-semibold flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading.cancel}
              >
                {loading.cancel ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                ) : (
                  "Cancel"
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleAccept}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 w-1/2 rounded-xl text-sm font-semibold flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading.accept}
                >
                  {loading.accept ? (
                    <svg
                      className="animate-spin h-4 w-4 mr-1 text-white"
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
                        d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                  ) : (
                    "Accept"
                  )}
                </button>
                <button
                  onClick={handleReject}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 w-1/2 rounded-xl text-sm font-semibold flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading.reject}
                >
                  {loading.reject ? (
                    <svg
                      className="animate-spin h-4 w-4 mr-1 text-white"
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
                        d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                  ) : (
                    "Reject"
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Timestamp Section */}
        <div
          className={`absolute bottom-2 w-full ${
            isSender ? "text-right pr-8" : "text-left pl-2"
          } text-xs text-gray-400 font-medium`}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
