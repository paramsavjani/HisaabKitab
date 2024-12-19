import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext.js";

const Transactions = () => {
  const { user } = useContext(UserContext);
  const { chatId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const friendId = chatId.split("--")[1];

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
        setTransactions(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [friendId]);

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  const TransactionCard = ({ transaction }) => (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div>
        <p className="text-sm text-gray-400">
          {new Date(transaction.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p
          className={`text-lg font-semibold ${
            transaction.amount > 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          ₹{transaction.amount}
        </p>
      </div>
      <p className="text-sm text-gray-300">
        {transaction.description || "No description"}
      </p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex justify-center items-center h-32">
      <div className="loader border-4 border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
      <span className="ml-4 text-lg">Loading transactions...</span>
    </div>
  );

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
            user?.profilePicture ||
            "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
          }
          alt="Profile"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {user?.name || "Friend"}
          </h1>
          <span className="text-gray-400">Settled Up</span>
        </div>
        <p className="text-2xl font-bold text-green-400">₹0</p>
      </div>

      {/* Transactions Section */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900">
        {loading && <LoadingState />}
        {error && <ErrorState />}
        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-6">
            {Object.keys(groupedTransactions).map((date) => (
              <div key={date}>
                <div className="text-gray-400 text-sm mb-2">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </div>
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
      <div className="fixed bottom-0 w-full md:left-320 bg-gray-800 p-4 flex flex-row justify-between space-x-2 sm:space-x-4 z-50 md:w-[calc(100%-320px)]">
        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex-1">
          You Gave
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex-1">
          You Got
        </button>
      </div>
    </div>
  );
};

export default Transactions;
