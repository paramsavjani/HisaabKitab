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
    <>
      {/* Mobile View */}
      <div className="block md:hidden w-full px-2">
        <div
          className={`relative rounded-lg p-3 shadow-md max-w-[90%] ${
            isSender ? "ml-auto bg-gray-800" : "mr-auto bg-gray-700"
          }`}
        >
          {/* Tail */}
          <div
            className={`absolute top-4 ${
              isSender ? "right-[-6px]" : "left-[-6px]"
            }`}
          >
            <div
              className={`w-3 h-3 ${
                isSender ? "bg-gray-800" : "bg-gray-700"
              } transform rotate-45`}
            ></div>
          </div>

          {/* Content */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">
                {new Date(createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <p
                className={`text-xl font-bold ${
                  status === "rejected"
                    ? "text-red-600 font-bold line-through"
                    : (amount > 0 &&
                        transaction.sender.username === userUsername) ||
                      (amount < 0 &&
                        transaction.sender.username !== userUsername)
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₹{Math.abs(amount)}
              </p>
            </div>
            <p className="text-sm text-gray-300 truncate">
              {description || "No Description"}
            </p>

            {/* Pending Actions */}
            {status === "pending" && isSender ? (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => CancelTransaction(transactionId)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md shadow-sm text-sm transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              status === "pending" &&
              !isSender && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => AcceptTransaction(transactionId)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md shadow-sm text-sm transition-all duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => DenyTransaction(transactionId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-sm text-sm transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Laptop/Desktop View */}
      <div className="hidden md:block w-full px-4">
        <div
          className={`relative rounded-lg p-4 shadow-lg max-w-[60%] ${
            isSender ? "ml-auto bg-gray-800" : "mr-auto bg-gray-700"
          }`}
        >
          {/* Tail */}
          <div
            className={`absolute top-4 ${
              isSender ? "right-[-6px]" : "left-[-6px]"
            }`}
          >
            <div
              className={`w-3 h-3 ${
                isSender ? "bg-gray-800" : "bg-gray-700"
              } transform rotate-45`}
            ></div>
          </div>

          {/* Content */}
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-medium">
                {new Date(createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <p
                className={`text-xl font-bold ${
                  status === "rejected"
                    ? "text-red-600 font-bold line-through"
                    : (amount > 0 &&
                        transaction.sender.username === userUsername) ||
                      (amount < 0 &&
                        transaction.sender.username !== userUsername)
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₹{Math.abs(amount)}
              </p>
            </div>
            <p className="text-sm text-gray-300">{description || ""}</p>

            {/* Pending Actions */}
            {status === "pending" && isSender ? (
              <div className="flex space-x-3 mt-2">
                <button
                  onClick={() => CancelTransaction(transactionId)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md shadow-md font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              status === "pending" &&
              !isSender && (
                <div className="flex space-x-3 mt-2">
                  <button
                    onClick={() => AcceptTransaction(transactionId)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md font-medium transition-all duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => DenyTransaction(transactionId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md font-medium transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionCard;
