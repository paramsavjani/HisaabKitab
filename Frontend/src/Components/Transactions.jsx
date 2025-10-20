import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import TransactionCard from "./TransactionCard";
import TransactionModal from "./TransactionModel";
import UserContext from "../context/UserContext.js";
import "./styles.css";
import socket from "../socket.js";

const Transactions = () => {
  const { chatId } = useParams();
  const [total, setTotal] = useState(null);
  const [friend, setFriend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null); // 'give' or 'get'
  const userUsername = chatId.split("--")[0];
  const friendId = chatId.split("--")[1];
  const lastTransactionRef = useRef(null);
  const [friendTransactions, setFriendTransactions] = useState([]);
  const {
    user,
    activeFriends,
    setActiveFriends,
    transactions,
    setTransactions,
  } = React.useContext(UserContext);

  useEffect(() => {
    socket.on("newTransaction", (newTransaction) => {
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction,
      ]);
      setFriendTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction,
      ]);
    });

    socket.on("acceptTransaction", (_id) => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id
            ? { ...transaction, status: "completed" }
            : transaction
        )
      );
      setFriendTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id
            ? { ...transaction, status: "completed" }
            : transaction
        )
      );
    });

    socket.on("rejectTransaction", (_id) => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id
            ? { ...transaction, status: "rejected" }
            : transaction
        )
      );
      setFriendTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === _id
            ? { ...transaction, status: "rejected" }
            : transaction
        )
      );
    });

    socket.on("cancelTransaction", (_id) => {
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== _id)
      );
      setFriendTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id !== _id)
      );
    });

    return () => {
      socket.off("newTransaction");
      socket.off("acceptTransaction");
      socket.off("rejectTransaction");
      socket.off("cancelTransaction");
    };
  }, []);

  useEffect(() => {
    if (user) {
      const friendMain = activeFriends.find(
        (friend) => friend.username === friendId
      );
      if (!friendMain) {
        window.history.pushState({}, "", "/dashboard");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
      if (userUsername !== user.username) {
        window.history.pushState(
          {},
          "",
          "/transactions/" + user.username + "--" + friendId
        );
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
  });

  const handleButtonClick = (type) => {
    setTransactionType(type);
    setIsModalOpen(true);
  };

  useEffect(() => {
    document.title = "Transactions";
    if (!user) {
      window.location.replace("/login");
      return;
    }
    if (user?.username !== userUsername) {
      window.location.replace(
        "/transactions/" + user.username + "--" + friendId
      );
      return;
    }

    const friendMain = activeFriends.find(
      (friend) => friend.username === friendId
    );
    setFriend(() => friendMain);

    setFriendTransactions(() => {
      const friendTransactions = transactions?.filter(
        (transaction) =>
          (transaction.sender === user?._id &&
            transaction.receiver === friendMain?._id) ||
          (transaction.receiver === user?._id &&
            transaction.sender === friendMain?._id)
      );

      return friendTransactions?.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    setActiveFriends((prevActiveFriends) => {
      const updatedActiveFriends = prevActiveFriends?.map((friend) => {
        if (friend.username === friendId) {
          return {
            ...friend,
            isActive: true,
          };
        }
        return friend;
      });
      return updatedActiveFriends;
    });
  }, [friendId, userUsername]);

  useEffect(() => {
    let accumulatedTotal = 0;

    for (let transaction of friendTransactions) {
      if (transaction.status === "completed") {
        if (transaction.sender === user._id) {
          accumulatedTotal += transaction.amount; // Amount to totalGive
        } else {
          accumulatedTotal -= transaction.amount; // Amount to totalTake
        }
      }
    }
    accumulatedTotal = Number(accumulatedTotal.toFixed(2));

    setActiveFriends((prevActiveFriends) => {
      const updatedActiveFriends = prevActiveFriends?.map((friend) => {
        if (friend.username === friendId) {
          return {
            ...friend,
            totalAmount: accumulatedTotal.toFixed(2),
          };
        }
        return friend;
      });
      return updatedActiveFriends;
    });

    setTotal(() => accumulatedTotal);
  }, [userUsername, friendTransactions, setFriendTransactions]);

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    }, {});
  };
  const groupedTransactions = groupTransactionsByDate(friendTransactions);

  useEffect(() => {
    if (lastTransactionRef.current) {
      lastTransactionRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [friendTransactions]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-40 h-40 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center mb-8 shadow-3xl border border-gray-800/50">
        <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-3xl font-bold text-white mb-4" style={{
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
      }}>No transactions yet</h3>
      <p className="text-gray-400 text-center max-w-lg text-xl" style={{
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
      }}>
        Start your financial journey by adding your first transaction with this friend.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{
      background: 'linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)'
    }}>
      {/* Ultra Black Premium Header */}
      <div className="merienda-regular md:w-[calc(100%-320px)] bg-gradient-to-r from-black via-gray-900 to-black shadow-3xl backdrop-blur-sm border-b border-gray-800/60 p-6 pl-20 md:pl-8 mb-8 flex items-center space-x-6 mx-auto w-full justify-start fixed top-0 z-10" style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}>
        <div className="relative">
          <img
            src={
              friend?.profilePicture ? `${friend?.profilePicture}` : "/user2.png"
            }
            alt="Profile"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-gray-700 shadow-3xl"
            style={{
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 0, 0, 0.5)'
            }}
          />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-black shadow-2xl animate-pulse"></div>
        </div>
        <Link to={`/users/${friend?.username}`} className="flex-1">
          <h1 className="text-2xl font-black sm:text-3xl md:text-4xl text-white" style={{
            textShadow: '0 3px 6px rgba(0, 0, 0, 0.9)'
          }}>
            {friend?.name.length > 12
              ? friend?.name.substr(0, 10) + "..."
              : friend?.name || "Friend"}
          </h1>
          <p className="text-base text-gray-400 font-bold">@{friend?.username}</p>
        </Link>
        <div className="text-right">
          <p
            className={`kranky-regular text-3xl sm:text-4xl font-black ${
              (total ? total : friend?.totalAmount) < 0
                ? "text-red-300"
                : "text-green-300"
            } drop-shadow-3xl`}
            style={{
              textShadow: (total ? total : friend?.totalAmount) < 0 
                ? '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)' 
                : '0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.4)'
            }}
          >
            ₹{Math.abs(total ? total : friend?.totalAmount)}
          </p>
          <p className="text-base text-gray-400 font-bold">
            {(total ? total : friend?.totalAmount) < 0 ? "You owe" : "You're owed"}
          </p>
        </div>
      </div>

      {/* Ultra Black Transactions Section */}
      {
        <div className="flex-1 pt-36 md:pt-40 mx-auto w-full p-5 sm:p-8 space-y-8 bg-black overflow-y-auto">
          {transactions?.length > 0 && (
            <div className="space-y-0">
              {Object.keys(groupedTransactions)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in descending order
                .map((date) => (
                  <div key={date}>
                    <div className="flex justify-center items-center my-10">
                      <div className="flex justify-center items-center bg-gradient-to-r from-gray-900 to-black backdrop-blur-2xl text-gray-200 text-base h-14 w-56 rounded-full shadow-3xl border border-gray-800/60 font-bold" style={{
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}>
                        {new Date(
                          groupedTransactions[date][0].createdAt
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {groupedTransactions[date]?.map((transaction, index) => (
                        <div
                          ref={
                            index === groupedTransactions[date].length - 1
                              ? lastTransactionRef
                              : null
                          }
                          className={`${
                            index === groupedTransactions[date].length - 1
                              ? "md:pb-32 pb-32"
                              : ""
                          }`}
                          key={transaction._id}
                        >
                          <TransactionCard
                            transaction={transaction}
                            userId={user._id}
                            setFriendTransactions={setFriendTransactions}
                            friendUsername={friendId}
                            fcmToken={friend?.fcmToken}
                            friendId={friend?._id}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {transactions.length === 0 && <EmptyState />}
        </div>
      }

      {/* Ultra Black Premium Bottom Button Bar */}
      <div className="merienda-regular fixed bottom-0 w-full md:left-320 bg-gradient-to-t from-black via-gray-900 to-transparent backdrop-blur-sm border-t border-gray-800/60 p-6 flex flex-row justify-between space-x-5 sm:space-x-6 md:w-[calc(100%-320px)]" style={{
        boxShadow: '0 -20px 40px -10px rgba(0, 0, 0, 0.9)'
      }}>
        <button
          onClick={() => handleButtonClick("give")}
          className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white py-5 px-10 rounded-3xl flex-1 shadow-3xl transform hover:scale-105 transition-all duration-500 font-black flex items-center justify-center space-x-4 border border-red-600/40 text-lg"
          style={{
            boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.3)'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-xl">You Gave</span>
        </button>
        <button
          onClick={() => handleButtonClick("get")}
          className="bg-gradient-to-r from-green-700 via-green-800 to-green-900 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white py-5 px-10 rounded-3xl flex-1 shadow-3xl transform hover:scale-105 transition-all duration-500 font-black flex items-center justify-center space-x-4 border border-green-600/40 text-lg"
          style={{
            boxShadow: '0 20px 40px -10px rgba(34, 197, 94, 0.5), 0 0 0 1px rgba(34, 197, 94, 0.3)'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-xl">You Got</span>
        </button>
      </div>

      {isModalOpen && (
        <TransactionModal
          transactionType={transactionType}
          setIsModalOpen={setIsModalOpen}
          setFriendTransactions={setFriendTransactions}
          friend={friend}
          setTransactions={setTransactions}
          setActiveFriends={setActiveFriends}
        />
      )}
    </div>
  );
};

export default Transactions;