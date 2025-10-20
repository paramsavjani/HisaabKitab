import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import "./styles.css";
import UserContext from "../context/UserContext.js";
import socket from "../socket.js";
import rejectedIcon from "../assets/icons/rejected.png";

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
      className={`w-full px-4 sm:px-6 py-4 flex ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative p-6 pb-16 ${
          status === "rejected" ? "pb-8" : ""
        } rounded-3xl shadow-2xl backdrop-blur-sm border border-gray-800/40 min-w-[240px] sm:min-w-[280px] md:min-w-[320px] max-w-[95vw] sm:max-w-[280px] md:max-w-[320px] ${
          isSender 
            ? "bg-gradient-to-br from-black via-gray-900 to-black" 
            : "bg-gradient-to-br from-gray-900 via-black to-gray-900"
        } transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] hover:border-gray-700/50`}
        style={{
          boxShadow: isSender 
            ? '0 30px 60px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 30px 60px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Premium Modern Tail Design - Fixed positioning */}
        <div
          className={`absolute w-8 h-8 ${
            isSender 
              ? "bg-gradient-to-br from-black via-gray-900 to-black right-[-16px] border-r border-b border-gray-700/40" 
              : "bg-gradient-to-br from-gray-900 via-black to-gray-900 left-[-16px] border-l border-b border-gray-700/40"
          } top-8 rotate-45 shadow-2xl`}
          style={{
            boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.9)'
          }}
        ></div>

        {/* Status Badge - Fixed positioning to avoid overlap */}
        {status === "completed" && (
          <div className={`absolute top-4 ${isSender ? "left-4" : "right-4"} bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-2 rounded-full font-bold shadow-xl border border-green-500/40 z-10`}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Completed</span>
            </div>
          </div>
        )}

        {/* Amount Section - Fixed positioning and spacing */}
        <div
          className={`text-4xl sm:text-5xl kranky-regular font-black mb-6 ${
            status === "rejected" ? "mb-4" : ""
          } ${isSender ? "text-right" : "text-left"} ${
            (isSender && transaction.amount > 0) ||
            (!isSender && transaction.amount < 0)
              ? "text-green-300"
              : "text-red-300"
          } ${status === "rejected" ? "line-through text-gray-400" : ""} drop-shadow-2xl`}
          style={{
            textShadow: (isSender && transaction.amount > 0) || (!isSender && transaction.amount < 0)
              ? '0 0 30px rgba(34, 197, 94, 0.5), 0 0 60px rgba(34, 197, 94, 0.3)'
              : '0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)',
            filter: 'drop-shadow(0 0 15px rgba(0, 0, 0, 0.8))'
          }}
        >
          ₹{Math.abs(amount)}
        </div>

        {/* Description Section - Better spacing */}
        {description && (
          <div
            className={`text-lg sm:text-xl italic caveat-regular text-gray-200 break-words ${
              isSender ? "text-right pl-4 sm:pl-8" : "text-left pr-4 sm:pr-8"
            } leading-relaxed font-medium mb-4`}
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)'
            }}
          >
            {description}
          </div>
        )}

        {/* Enhanced Rejected Icon - Fixed positioning */}
        {status === "rejected" && (
          <div className={`absolute top-6 ${isSender ? "left-6" : "right-6"} flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-full backdrop-blur-sm border border-red-600/40 shadow-2xl z-10`}>
            <div className="relative">
              <img
                src={rejectedIcon}
                alt="Rejected"
                className="w-12 h-12 sm:w-14 sm:h-14 filter drop-shadow-2xl"
              />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-pulse border-2 border-black"></div>
            </div>
          </div>
        )}

        {/* Premium Action Buttons - Better spacing */}
        {status === "pending" && (
          <div
            className={`flex space-x-3 sm:space-x-4 mt-6 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {isSender ? (
              <button
                onClick={handleCancel}
                className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 text-white px-8 py-4 w-full rounded-2xl text-base font-bold flex items-center justify-center transition-all duration-500 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/40 shadow-xl"
                disabled={loading.cancel}
                style={{
                  boxShadow: '0 15px 35px -5px rgba(245, 158, 11, 0.5), 0 0 0 1px rgba(245, 158, 11, 0.3)'
                }}
              >
                {loading.cancel ? (
                  <svg
                    className="animate-spin h-6 w-6 mr-3 text-white"
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
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white px-6 py-4 w-1/2 rounded-2xl text-base font-bold flex items-center justify-center transition-all duration-500 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/40 shadow-xl"
                  disabled={loading.accept}
                  style={{
                    boxShadow: '0 15px 35px -5px rgba(34, 197, 94, 0.5), 0 0 0 1px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  {loading.accept ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
                  className="bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:via-pink-500 hover:to-rose-500 text-white px-6 py-4 w-1/2 rounded-2xl text-base font-bold flex items-center justify-center transition-all duration-500 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/40 shadow-xl"
                  disabled={loading.reject}
                  style={{
                    boxShadow: '0 15px 35px -5px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {loading.reject ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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

        {/* Premium Timestamp Section - Fixed positioning */}
        <div
          className={`absolute bottom-4 w-full ${
            isSender ? "text-right pr-12 sm:pr-16" : "text-left pl-4 sm:pl-0"
          } text-sm text-gray-400 font-bold`}
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)'
          }}
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