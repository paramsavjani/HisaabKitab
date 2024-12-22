import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import TransactionCard from "./TransactionCard";
import TransactionModal from "./TransactionModel";
import TransactionSkeleton from "./TransactionSkeleton";
import { toast } from "react-toastify";
import UserContext from "../context/UserContext.js";
import useDashboardContext from "../context/DashboardContext.js";

const Transactions = () => {
  const { chatId } = useParams();
  const [total, setTotal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friend, setFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null); // 'give' or 'get'
  const userUsername = chatId.split("--")[0];
  const friendId = chatId.split("--")[1];
  const lastTransactionRef = useRef(null);
  const { accessToken, refreshToken } = React.useContext(UserContext);
  const { activeFriends, setActiveFriends } = useDashboardContext();

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
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              accessToken,
              refreshToken,
            }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch transactions");
        }

        const data = await res.json();
        setTransactions(data.transactions.reverse()); // No need to reverse, just set the data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    console.log(activeFriends.find((f) => f.username === friendId));

    setFriend(activeFriends.find((friend) => friend.username === friendId));

    fetchTransactions();
  }, [accessToken, friendId, refreshToken]);

  useEffect(() => {
    if (error || loading) {
      return;
    }
    let accumulatedTotal = 0;

    for (let transaction of transactions) {
      if (transaction.status === "completed") {
        if (transaction.sender.username === userUsername) {
          accumulatedTotal += transaction.amount; // Amount to totalGive
        } else {
          accumulatedTotal -= transaction.amount; // Amount to totalTake
        }
      }
    }

    setActiveFriends((prevActiveFriends) => {
      const updatedActiveFriends = prevActiveFriends.map((friend) => {
        if (friend.username === friendId) {
          return {
            ...friend,
            totalAmount: accumulatedTotal,
          };
        }
        return friend;
      });
      return updatedActiveFriends;
    });

    setTotal(() => accumulatedTotal);
  }, [transactions, userUsername]);

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    }, {});
  };
  const groupedTransactions = groupTransactionsByDate(transactions);

  // Scroll to the bottom whenever transactions are updated
  useEffect(() => {
    if (lastTransactionRef.current) {
      lastTransactionRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [transactions]); // Trigger scroll when transactions update

  const ErrorState = () => (
    <div className="text-red-500 text-center text-lg">{error}</div>
  );

  const EmptyState = () => (
    <div className="text-center text-lg text-gray-400">
      No transactions found with this user.
    </div>
  );


  if (error) {
    toast.error(error, {
      position: "top-right",
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return <TransactionSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Profile Section */}
      <div className="merienda-regular md:w-[calc(100%-320px)] bg-gray-800 shadow-lg p-4 pl-16 md:pl-6 mb-6 flex items-center space-x-4 mx-auto w-full justify-start fixed top-0 z-10">
        <img
          src={
            friend?.profilePicture ||
            "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
          }
          alt="Profile"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
        />
        <Link to={`/users/${friend?.username}`} className="flex-1">
          <h1 className="text-xl font-bold sm:text-3xl">
            {friend?.name || "Friend"}
          </h1>
        </Link>
        <p
          className={`kranky-regular text-2xl font-bold ${
            (total ? total : friend?.totalAmount) < 0
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          ₹{Math.abs(total ? total : friend?.totalAmount)}
        </p>
      </div>

      {/* Transactions Section */}
      {loading ? (
        <TransactionSkeleton />
      ) : (
        <div className="flex-1 pt-24 md:pt-28 mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900 overflow-y-auto">
          {error && <ErrorState />}
          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-6">
              {Object.keys(groupedTransactions)
                .sort((a, b) => new Date(b) - new Date(a)) // Sort dates in descending order
                .map((date) => (
                  <div key={date}>
                    <div className="flex justify-center items-center">
                      <div className="flex justify-center items-center bg-gray-800 text-gray-400 text-sm h-8 w-36 rounded shadow-lg">
                        {new Date(
                          groupedTransactions[date][0].createdAt
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="space-y-0">
                      {groupedTransactions[date].map((transaction, index) => (
                        <div
                          ref={
                            index === groupedTransactions[date].length - 1
                              ? lastTransactionRef
                              : null
                          }
                          className={`${
                            index === groupedTransactions[date].length - 1
                              ? "md:pb-20 pb-20"
                              : ""
                          }`}
                          key={transaction.transactionId}
                        >
                          <TransactionCard
                            transaction={transaction}
                            userUsername={userUsername}
                            setTransactions={setTransactions}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {!loading && !error && transactions.length === 0 && <EmptyState />}
        </div>
      )}

      {/* Bottom Button Bar */}
      <div className="fixed bottom-0 w-full md:left-320 bg-gray-800 p-4 flex flex-row justify-between space-x-2 sm:space-x-4 md:w-[calc(100%-320px)]">
        <button
          onClick={() => handleButtonClick("give")}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex-1"
          style={{ fontFamily: "Agu Display" }}
        >
          You Gave
        </button>
        <button
          onClick={() => handleButtonClick("get")}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex-1"
          style={{ fontFamily: "Agu Display" }}
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
