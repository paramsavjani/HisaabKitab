import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext.js";

function Transactions() {
  const { user } = useContext(UserContext);
  const { chatId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const friendId = chatId.split("--")[1];

  useEffect(() => {
    document.title = "Transactions";
    async function fetchTransactions() {
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
          setError(data.message);
          return;
        }
        const data = await res.json();
        setTransactions(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user, friendId]);

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user.name || "Friend"}</h1>
            <span className="text-gray-400">Settled Up</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">₹0</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="loader border-4 border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
          <span className="ml-4 text-lg">Loading transactions...</span>
        </div>
      )}

      {/* Error State */}
      {error && <div className="text-red-500 text-center text-lg">{error}</div>}

      {/* Transactions Section */}
      {!loading && !error && transactions.length > 0 && (
        <div className="space-y-6">
          {Object.keys(groupedTransactions).map((date) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="text-gray-400 text-sm mb-2">
                {date} •{" "}
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </div>
              {/* Transaction Entries */}
              <div className="space-y-4">
                {groupedTransactions[date].map((transaction) => (
                  <div
                    key={transaction.transactionId}
                    className="bg-gray-800 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          transaction.amount > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        ₹{transaction.amount}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300">
                      {transaction.description || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-center text-lg text-gray-400">
          No transactions found with this user.
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 flex justify-between">
        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-[48%]">
          You Gave
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-[48%]">
          You Got
        </button>
      </div>
    </div>
  );
}

export default Transactions;
