import React from "react";

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

  return (
    <div
      className={`w-full px-4 py-2 flex ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative p-4 rounded-xl shadow-md min-w-[200px] max-w-[75%] ${
          isSender ? "bg-gray-700" : "bg-gray-800"
        }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Amount Section */}
        <div
          className={`text-2xl font-semibold ${
            isSender ? "text-gray-300" : "text-red-400"
          }`}
        >
          ₹{Math.abs(amount)}
        </div>

        {/* Description Section */}
        {description && (
          <p className="text-sm text-gray-300 mt-2 truncate">{description}</p>
        )}

        {/* Action Buttons */}
        {status === "pending" && (
          <div className="flex space-x-2 mt-3">
            {isSender ? (
              <button
                onClick={() => CancelTransaction(transactionId)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Cancel
              </button>
            ) : (
              <>
                <button
                  onClick={() => AcceptTransaction(transactionId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => DenyTransaction(transactionId)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        )}

        {/* Tail Design */}
        <div
          className={`absolute w-4 h-4 ${
            isSender ? "bg-gray-700 right-[-8px]" : "bg-gray-800 left-[-8px]"
          } top-4 rotate-45`}
        ></div>
      </div>
    </div>
  );
};

export default TransactionCard;
