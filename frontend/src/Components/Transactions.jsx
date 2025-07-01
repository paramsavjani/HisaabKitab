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
    accumulatedTotal = Number(accumulatedTotal.toFixed(2))

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
    <div className="text-center text-lg text-gray-400">
      No transactions found with this user.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Profile Section */}
      <div className="merienda-regular md:w-[calc(100%-320px)] bg-gray-800 shadow-lg p-4 pl-16 md:pl-6 mb-6 flex items-center space-x-4 mx-auto w-full justify-start fixed top-0 z-10">
        <img
          src={
            friend?.profilePicture ? `${friend?.profilePicture}` :
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
      {
        <div className="flex-1 pt-24 md:pt-28 mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900 overflow-y-auto">
          {transactions?.length > 0 && (
            <div className="space-y-6">
              {Object.keys(groupedTransactions)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in descending order
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
                      {groupedTransactions[date]?.map((transaction, index) => (
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

      {/* Bottom Button Bar */}
      <div className="merienda-regular fixed bottom-0 w-full md:left-320 bg-gray-900 p-4 flex flex-row justify-between space-x-2 sm:space-x-4 md:w-[calc(100%-320px)]">
        <button
          onClick={() => handleButtonClick("give")}
          className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white py-2 px-4 rounded-lg flex-1 shadow-lg transform hover:scale-105 transition duration-300"
        >
          You Gave
        </button>
        <button
          onClick={() => handleButtonClick("get")}
          className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-500 hover:via-teal-600 hover:to-cyan-600 text-white py-2 px-4 rounded-lg flex-1 shadow-lg transform hover:scale-105 transition duration-300"
        >
          You Got
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