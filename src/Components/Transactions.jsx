import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext.js";

function Transactions() {
  const { user } = useContext(UserContext);
  const { chatId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!user) {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const userId = chatId.split("--")[0];
  const friendId = chatId.split("--")[1];

  if (!friendId || !userId) {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  if (user?.username !== userId) {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

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
          throw new Error("Failed to fetch transactions");
        }
        const data = await res.json();
        setTransactions(data.data); // Assuming data.transactions is the list
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user, friendId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Transaction History
      </h1>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="loader border-4 border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
          <span className="ml-4 text-lg">Loading transactions...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-center text-lg">
          Failed to load transactions: {error}
        </div>
      )}

      {/* Transactions List */}
      {!loading && !error && transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-blue-600">
                <th className="p-3">#</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Description</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className="border-b hover:bg-gray-700 transition-all"
                >
                  <td className="p-3">{index + 1}</td>
                  <td
                    className={`p-3 ${
                      transaction.type === "give"
                        ? "text-red-400"
                        : "text-green-400"
                    } font-semibold`}
                  >
                    {transaction.type === "give" ? "You Gave" : "You Took"}
                  </td>
                  <td className="p-3 font-medium">${transaction.amount}</td>
                  <td className="p-3">{transaction.description || "N/A"}</td>
                  <td className="p-3">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-center text-lg text-gray-400">
          No transactions found with this user.
        </div>
      )}
    </div>
  );
}

export default Transactions;
