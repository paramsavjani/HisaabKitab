import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TransactionCard from "./TransactionCard";
import TransactionModal from "./TransactionModel";
import { toast } from "react-toastify";

const Transactions = () => {
  const { chatId } = useParams();
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friend, setFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null); // 'give' or 'get'
  const userUsername = chatId.split("--")[0];
  const friendId = chatId.split("--")[1];

  const handleButtonClick = (type) => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

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
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${transactionId}/deny`,
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

  const CancelTransaction = async (transactionId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${transactionId}/cancel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log(data.message);
      if (!res.ok) {
        console.log(res);
        return;
      }
      toast.success(data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t.transactionId !== transactionId)
      );
    } catch (err) {
      console.log(err);
    }
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
      <div className="md:w-[calc(100%-320px)] bg-gray-800 shadow-lg p-4 pl-16 md:pl-6 mb-6 flex items-center space-x-4 mx-auto w-full justify-start fixed top-0 z-10">
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
      <div className="flex-1 pb-24 md:pb-24 pt-24 md:pt-28 sm:pb-24 mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900">
        {loading && <SkeletonTransactions />}
        {error && <ErrorState />}
        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-6">
            {Object.keys(groupedTransactions).map((date) => (
              <div key={date}>
                <div className="text-gray-400 text-sm mb-2">{date}</div>
                <div className="space-y-0">
                  {groupedTransactions[date].map((transaction) => (
                    <TransactionCard
                      key={transaction.transactionId}
                      transaction={transaction}
                      AcceptTransaction={AcceptTransaction}
                      CancelTransaction={CancelTransaction}
                      DenyTransaction={DenyTransaction}
                      userUsername={userUsername}
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
          transactionType={transactionType}
          friendId={friendId}
          setIsModalOpen={setIsModalOpen}
          transactions={transactions}
          setTransactions={setTransactions}
        />
      )}
    </div>
  );
};

export default Transactions;
