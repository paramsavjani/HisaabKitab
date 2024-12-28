import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import UserContext from "../context/UserContext.js";
import socket from "../socket.js";

const TransactionModal = ({
  transactionType,
  setIsModalOpen,
  setFriendTransactions,
  friend,
  setTransactions,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for the submit button
  const { accessToken, refreshToken } = React.useContext(UserContext);
  const amountInputRef = useRef(null);

  useEffect(() => {
    // Focus on the amount input when the modal opens
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    setIsLoading(true); // Set loading state to true when submitting

    try {
      const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${friend.username}/add`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount:
            transactionType === "give" ? Math.abs(amount) : -Math.abs(amount),
          description,
          accessToken,
          refreshToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "colored",
        });
      }

      setIsModalOpen(false);

      socket.emit("newTransaction", {
        amount: data.transaction._doc.amount,
        description: data.transaction._doc.description,
        _id: data.transaction._doc._id,
        createdAt: data.transaction._doc.createdAt,
        status: data.transaction._doc.status,
        sender: data.transaction._doc.sender,
        friendUsername: friend.username,
        fcmToken: friend.fcmToken,
        friendName: friend.name,
      });

      setFriendTransactions((prev) => [
        ...prev,
        {
          amount: data.transaction._doc.amount,
          description: data.transaction._doc.description,
          _id: data.transaction._doc._id,
          createdAt: data.transaction._doc.createdAt,
          status: data.transaction._doc.status,
          sender: data.transaction._doc.sender,
        },
      ]);
      setTransactions((prev) => [
        ...prev,
        {
          amount: data.transaction._doc.amount,
          description: data.transaction._doc.description,
          _id: data.transaction._doc._id,
          createdAt: data.transaction._doc.createdAt,
          status: data.transaction._doc.status,
          sender: data.transaction.sender,
        },
      ]);

      setAmount("");
      setDescription("");
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false); // Set loading state back to false after submit is complete
    }
  };

  // Handle "Enter" key press to submit the form
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default behavior of moving to the next field
      handleSubmit(); // Directly submit the form
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 md:p-8 w-11/12 sm:w-96 space-y-6 md:space-y-8 shadow-lg max-w-lg">
        <h2 className="text-2xl font-semibold text-white text-center">
          {transactionType === "give" ? "You Gave" : "You Got"} Money
        </h2>

        <input
          ref={amountInputRef} // Reference for auto-focus
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown} // Submit the form on Enter
          placeholder="Enter amount"
          className="w-full p-3 bg-gray-700 text-white rounded-md outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full p-3 bg-gray-700 text-white rounded-md outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300"
        ></textarea>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-1/2 mr-2 bg-red-600 px-4 py-3 rounded-md text-white text-lg font-semibold hover:bg-red-700 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading} // Disable button while loading
            className={`w-1/2 ml-2 ${
              isLoading ? "bg-green-800" : "bg-green-600"
            } px-4 py-3 rounded-md text-white text-lg font-semibold hover:${
              isLoading ? "" : "bg-green-700"
            } transition duration-300`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
