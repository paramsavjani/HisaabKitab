import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import TransactionCard from "./TransactionCard";
import TransactionModal from "./TransactionModel";
import UserContext from "../context/UserContext.js";
import "./styles.css";
import socket from "../socket.js";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

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
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </motion.div>
      <motion.h3
        className="text-xl font-semibold text-white mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        No transactions yet
      </motion.h3>
      <motion.p
        className="text-gray-400 text-center max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Start your financial journey by adding your first transaction with this friend.
      </motion.p>
    </motion.div>
  );

  // Animation variants from Dashboard
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      className="p-4 bg-black min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="merienda-regular w-full bg-gradient-to-r pl-14 from-slate-900 via-gray-950 to-slate-900 shadow-2xl p-4 mb-6 flex items-center justify-between fixed top-0 left-0 right-0 z-10 border-b border-slate-600/30">
        {/* Left Section - Menu and Profile */}
        <div className="flex items-center space-x-4">
          
          <img
            src={
              friend?.profilePicture ? `${friend?.profilePicture}` : "/user2.png"
            }
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-slate-500 shadow-xl object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-white">
              {friend?.name.length > 12
                ? friend?.name.substr(0, 10) + "..."
                : friend?.name || "Friend"}
            </h1>
            <p className="text-xs text-slate-300">@{friend?.username}</p>
          </div>
        </div>
        
        {/* Right Section - Balance */}
        <div className="text-right">
          <p
            className={`kranky-regular text-xl font-bold ${(total ? total : friend?.totalAmount) < 0
                ? "text-red-400"
                : "text-green-400"
              }`}
          >
            ₹{Math.abs(total ? total : friend?.totalAmount)}
          </p>
          <p className="text-xs text-slate-300">
            {(total ? total : friend?.totalAmount) < 0 ? "You owe" : "You're owed"}
          </p>
        </div>
      </div>

      {/* Mobile Transactions List with Dashboard-style Animation */}
      <motion.div className="block md:hidden pt-20" variants={containerVariants}>
        <motion.ul
          className="merienda-regular divide-y divide-gray-700/40 rounded-xl overflow-hidden backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.8)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
          animate={{
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
              when: "beforeChildren"
            }
          }}
        >
          <AnimatePresence>
            {transactions?.length > 0 ? (
              Object.keys(groupedTransactions)
                .sort((a, b) => new Date(a) - new Date(b))
                .map((date) => (
                  <motion.div key={date} className="space-y-2">
                    {/* Date Header */}
                    <motion.div
                      className="mx-auto w-fit px-2 py-2 bg-gray-800/50 text-center rounded-md"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-sm text-gray-400 font-medium">
                        {new Date(
                          groupedTransactions[date][0].createdAt
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </motion.div>

                    {/* Transactions for this date */}
                    {groupedTransactions[date]?.map((transaction, index) => (
                      <motion.li
                        key={transaction._id}
                        variants={itemVariants}
                        whileHover={{
                          backgroundColor: "rgba(20, 20, 20, 0.8)",
                          x: 5,
                          transition: { duration: 0.2 },
                        }}
                        exit={{ opacity: 0, x: -100 }}
                        custom={index}
                        ref={
                          index === groupedTransactions[date].length - 1
                            ? lastTransactionRef
                            : null
                        }
                        className={`${index === groupedTransactions[date].length - 1
                            ? "pb-20"
                            : ""
                          }`}
                      >
                        <TransactionCard
                          transaction={transaction}
                          userId={user._id}
                          setFriendTransactions={setFriendTransactions}
                          friendUsername={friendId}
                          fcmToken={friend?.fcmToken}
                          friendId={friend?._id}
                        />
                      </motion.li>
                    ))}
                  </motion.div>
                ))
            ) : (
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center"
              >
                <EmptyState />
              </motion.li>
            )}
          </AnimatePresence>
        </motion.ul>
      </motion.div>

      {/* Mobile Bottom Action Bar - Icon Only */}
      <motion.div
        className="md:hidden fixed bottom-4 right-4 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex space-x-2">
          <motion.button
            onClick={() => handleButtonClick("give")}
            className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-xl flex items-center justify-center"
            whileHover={{
              scale: 1.1,
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.5)",
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowDownLeft className="w-6 h-6" />
          </motion.button>
            <motion.button
              onClick={() => handleButtonClick("get")}
              className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-xl flex items-center justify-center"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 10px 25px rgba(34, 197, 94, 0.5)",
              }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUpRight className="w-6 h-6" />
            </motion.button>
        </div>
      </motion.div>

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
    </motion.div>
  );
};

export default Transactions;