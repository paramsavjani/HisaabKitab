import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext.js";
import "./styles.css";

const AllTransactions = () => {
  const { user, activeFriends } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);

  // Dummy transactions (You would fetch this data from a database or API)
  const dummyTransactions = [
    { id: 1, from: "Friend1", to: "You", amount: 500, status: "pending" },
    { id: 2, from: "You", to: "Friend2", amount: 300, status: "pending" },
    { id: 3, from: "Friend3", to: "You", amount: 200, status: "pending" },
  ];

  useEffect(() => {
    // Set initial transactions
    setTransactions(dummyTransactions);
    document.title = "Transactions";
  }, []);

  const handleAccept = (id) => {
    setTransactions((prev) =>
      prev.map((txn) => (txn.id === id ? { ...txn, status: "accepted" } : txn))
    );
  };

  const handleReject = (id) => {
    setTransactions((prev) =>
      prev.map((txn) => (txn.id === id ? { ...txn, status: "rejected" } : txn))
    );
  };

  const handleAcceptAll = () => {
    setTransactions((prev) =>
      prev.map((txn) => ({ ...txn, status: "accepted" }))
    );
  };

  const handleRejectAll = () => {
    setTransactions((prev) =>
      prev.map((txn) => ({ ...txn, status: "rejected" }))
    );
  };

  return (
    <div className="p-4 md:bg-gray-950 bg-slate-950 min-h-screen text-white">
      {/* Header */}
      <div className="merienda-regular flex items-center justify-center pb-3">
        <Link
          to="/"
          className="text-4xl px-1 pt-2 pl-6 font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-blue-500 animate-text transform transition-transform duration-300"
          aria-label="Navigate to CashTrack homepage"
        >
          Hisaab <span className="text-white">Kitab</span>
        </Link>
      </div>

      {/* Transaction Management - Accept/Reject All */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleAcceptAll}
          className="bg-green-500 p-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Accept All
        </button>
        <button
          onClick={handleRejectAll}
          className="bg-red-500 p-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Reject All
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold">
                {txn.from} owes you ₹{txn.amount}
              </p>
              <p className="text-sm text-gray-400">
                Status:{" "}
                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
              </p>
            </div>

            {/* Accept / Reject buttons for each transaction */}
            <div className="flex space-x-4">
              <button
                onClick={() => handleAccept(txn.id)}
                className="bg-green-400 p-2 rounded-lg hover:bg-green-500 transition duration-300"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(txn.id)}
                className="bg-red-400 p-2 rounded-lg hover:bg-red-500 transition duration-300"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTransactions;
