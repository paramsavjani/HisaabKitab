import React, { useState } from "react";

const TransactionCard = ({
  transaction,
  userUsername,
  AcceptTransaction,
  CancelTransaction,
  DenyTransaction,
}) => {
  const { createdAt, amount, description, status, transactionId, sender } =
    transaction;

  const isSender = sender.username === userUsername;

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
      await AcceptTransaction(transactionId);
    } finally {
      setLoading((prev) => ({ ...prev, accept: false }));
    }
  };

  const handleReject = async () => {
    setLoading((prev) => ({ ...prev, reject: true }));
    try {
      await DenyTransaction(transactionId);
    } finally {
      setLoading((prev) => ({ ...prev, reject: false }));
    }
  };

  const handleCancel = async () => {
    setLoading((prev) => ({ ...prev, cancel: true }));
    try {
      await CancelTransaction(transactionId);
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
        className={`relative p-5 pb-10 rounded-xl shadow-md min-w-[200px] md:min-w-[300px] max-w-[200px] ${
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
          className={`text-3xl font-mono font-extrabold mb-4 ${
            isSender ? "text-right" : "text-left"
          } ${
           ( isSender && transaction.amount > 0) || (!isSender && transaction.amount < 0 )
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          ₹{Math.abs(amount)}
        </div>

        {/* Description Section */}
        {description && (
          <div
            className={`text-sm italic font-mono text-gray-300 truncate ${
              isSender ? "text-right pl-10" : "text-left pr-10"
            }`}
          >
            {description}
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
                className="bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 text-white px-3 py-1 w-1/2 rounded-md text-sm flex items-center justify-center"
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
