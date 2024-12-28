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
  console.log(transaction._id);
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
      className={`w-full px-4 py-3 flex ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative p-5 pb-10 ${
          status === "rejected" ? "pb-4" : ""
        } rounded-xl shadow-md min-w-[200px] md:min-w-[300px] max-w-[200px] ${
          isSender ? "bg-gray-700" : "bg-gray-800"
        }`}
      >
        {/* Tail Design */}
        <div
          className={`absolute w-4 h-4 ${
            isSender ? "bg-gray-700 right-[-8px]" : "bg-gray-800 left-[-8px]"
          } top-4 rotate-45`}
        ></div>

        {/* Amount Section */}
        <div
          className={`text-3xl kranky-regular font-extrabold mb-4 ${
            status === "rejected" ? "mb-0" : ""
          } ${isSender ? "text-right" : "text-left"} ${
            (isSender && transaction.amount > 0) ||
            (!isSender && transaction.amount < 0)
              ? "text-green-500"
              : "text-red-500"
          } ${status === "rejected" ? "line-through text-white" : ""}`}
        >
          ₹{Math.abs(amount)}
        </div>

        {/* Description Section */}
        {description && (
          <div
            className={`text-lg italic caveat-regular text-gray-300 truncate ${
              isSender ? "text-right pl-5" : "text-left pr-5"
            }`}
          >
            {description}
          </div>
        )}
        {status === "rejected" && (
          <div
            className={`relative w-20 h-20`} // Using relative for the parent div to position child absolutely
          >
            <img
              src={rejectedIcon}
              alt=""
              className={`absolute top-0 ${
                isSender ? "right-0" : "md:left-32 left-14"
              } w-20 h-20`} // Position based on isSender
            />
          </div>
        )}

        {/* Action Buttons */}
        {status === "pending" && (
          <div
            className={`flex space-x-0 mt-4 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {isSender ? (
              <button
                onClick={handleCancel}
                className="bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 text-white px-3 py-1 w-full rounded-md text-sm flex items-center justify-center"
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
                  className="bg-blue-600 mr-1 hover:bg-blue-700 border-2 border-blue-400 text-white px-3 py-1 w-1/2 rounded-md text-sm flex items-center justify-center"
                  disabled={loading.accept}
                >
                  {loading.accept ? (
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
                    "Accept"
                  )}
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 ml-1 hover:bg-red-700 border-2 border-red-400 text-white px-3 py-1 w-1/2 rounded-md text-sm flex items-center justify-center"
                  disabled={loading.reject}
                >
                  {loading.reject ? (
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
            isSender ? "text-right pr-10" : "text-left"
          } text-xs text-gray-400`}
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
