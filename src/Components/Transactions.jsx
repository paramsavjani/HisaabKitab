import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Transactions = () => {
  const { chatId } = useParams();
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friend, setFriend] = useState(null);

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
        setTransactions(data.transactions);
        for (let transaction of data.transactions) {
          if (transaction.status === "completed") {
            setTotal((prevTotal) => prevTotal + transaction.amount);
          }
        }
        setFriend(data.friend);
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

  const TransactionCard = ({ transaction, onAccept, onReject }) => {
    const { createdAt, amount, description, status, transactionId } =
      transaction;

    return (
      <div className="relative bg-gray-800 rounded-lg p-4 shadow-lg overflow-hidden">
        {status === "pending" ? (
          <div className="relative">
            <div className="relative z-1 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-medium mb-2">
                  {new Date(createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <p className="text-sm text-gray-300 truncate max-w-xs">
                  {description || "No Description"}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <p className="text-xl font-bold text-white">
                  ₹{Math.abs(amount)}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onAccept(transactionId)}
                    className="bg-green-600 hover:bg-green-700 text-white md:px-4 md:py-2 px-2 py-1 rounded-md shadow-md font-medium transition-all duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(transactionId)}
                    className="bg-red-600 hover:bg-red-700 text-white md:px-4 md:py-2 px-2 py-1 rounded-md shadow-md font-medium transition-all duration-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
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
                    ? "text-red-600 line-through"
                    : amount > 0
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
          </div>
        )}
      </div>
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
        <p className="text-2xl font-bold text-green-400">₹{total}</p>
      </div>

      {/* Transactions Section */}
      <div className="flex-1 max-w-3xl pb-24 md:pb-24 mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900">
        {loading && <SkeletonTransactions />}
        {error && <ErrorState />}
        {!loading && !error && transactions.length > 0 && (
          <>
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
          </>
        )}
        {!loading && !error && transactions.length === 0 && <EmptyState />}
      </div>

      {/* Bottom Button Bar */}
      <div className="fixed bottom-0 w-full md:left-320 bg-gray-800 p-4 flex flex-row justify-between space-x-2 sm:space-x-4 md:w-[calc(100%-320px)]">
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
