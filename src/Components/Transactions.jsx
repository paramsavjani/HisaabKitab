import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Transactions = () => {
  const { chatId } = useParams();
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friend, setFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null); // 'give' or 'get'
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const TransactionModal = ({ onClose, onSubmit }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 space-y-4">
        <h2 className="text-xl font-bold text-white">
          {transactionType === "give" ? "You Gave" : "You Got"} Money
        </h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full p-2 bg-gray-700 text-white rounded-md outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full p-2 bg-gray-700 text-white rounded-md outline-none"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-red-600 px-4 py-2 rounded-md text-white hover:bg-red-700"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-green-600 px-4 py-2 rounded-md text-white hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  const handleButtonClick = (type) => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${friendId}/add`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount:
            transactionType === "give" ? Math.abs(amount) : -Math.abs(amount),
          description,
        }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.message);

      // Update transactions locally if needed
      // setTransactions((prev) => [...prev, data.transaction]);
      setIsModalOpen(false);
      setAmount("");
      setDescription("");
    } catch (err) {
      console.error(err.message);
    }
  };

  const friendId = chatId.split("--")[1];
  const userUsername = chatId.split("--")[0];

  useEffect(() => {
    document.title = "Transactions";
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${friendId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch transactions");
        }

        const data = await res.json();
        console.log(data.transactions);
        setTransactions(data.transactions);
        console.log(data.transactions);
        setTotal(() => 0);

        setFriend(data.friend);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [friendId]);

  useEffect(() => {
    setTotal(() => 0);
    for (let transaction of transactions) {
      if (transaction.status === "completed") {
        if (transaction.sender.username === userUsername) {
          setTotal((prevTotal) => prevTotal + transaction.amount);
        } else {
          setTotal((prevTotal) => prevTotal - transaction.amount);
        }
      }
    }
  }, [transactions, setTransactions, userUsername]);

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  const SkeletonCard = () => (
    <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center animate-pulse">
      <div className="h-4 w-16 bg-gray-600 rounded"></div>
      <div className="h-6 w-24 bg-gray-600 rounded"></div>
    </div>
  );

  const SkeletonTransactions = () => (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <SkeletonCard key={index} />
        ))}
    </div>
  );

  const AcceptTransaction = async (transactionId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${transactionId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }
      setTransactions((prevTransactions) =>
        prevTransactions.map((prevTransaction) => {
          if (prevTransaction.transactionId === transactionId) {
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
    }
  };

  const DenyTransaction = async (transactionId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${transactionId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }

      setTransactions((prevTransactions) =>
        prevTransactions.map((prevTransaction) => {
          if (prevTransaction.transactionId === transactionId) {
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
    }
  };

  const TransactionCard = ({ transaction, currentUser }) => {
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
              {status === "pending" && isSender && (
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
              <p className="text-sm text-gray-300">
                {description || "No Description"}
              </p>

              {/* Pending Actions */}
              {status === "pending" && isSender && (
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
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const ErrorState = () => (
    <div className="text-red-500 text-center text-lg">{error}</div>
  );

  const EmptyState = () => (
    <div className="text-center text-lg text-gray-400">
      No transactions found with this user.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Profile Section */}
      <div className="bg-gray-800 shadow-lg p-4 pl-16 md:pl-6 mb-6 flex items-center space-x-4 max-w-3xl mx-auto w-full justify-start">
        <img
          src={
            friend?.profilePicture ||
            "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
          }
          alt="Profile"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold sm:text-3xl">
            {friend?.name || "Friend"}
          </h1>
          <span className="text-gray-400">Settled Up</span>
        </div>
        <p
          className={`text-2xl font-bold ${
            total < 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          ₹{Math.abs(total)}
        </p>
      </div>

      {/* Transactions Section */}
      <div className="flex-1 max-w-3xl pb-24 md:pb-24 sm:pb-24 mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900">
        {loading && <SkeletonTransactions />}
        {error && <ErrorState />}
        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-6">
            {Object.keys(groupedTransactions).map((date) => (
              <div key={date}>
                <div className="text-gray-400 text-sm mb-2">{date}</div>
                <div className="space-y-4">
                  {groupedTransactions[date].map((transaction) => (
                    <TransactionCard
                      key={transaction.transactionId}
                      transaction={transaction}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && transactions.length === 0 && <EmptyState />}
      </div>

      {/* Bottom Button Bar */}
      <div className="fixed bottom-0 w-full md:left-320 bg-gray-800 p-4 flex flex-row justify-between space-x-2 sm:space-x-4 md:w-[calc(100%-320px)]">
        <button
          onClick={() => handleButtonClick("give")}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex-1"
        >
          You Gave
        </button>
        <button
          onClick={() => handleButtonClick("get")}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex-1"
        >
          You Got
        </button>
      </div>
      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Transactions;
