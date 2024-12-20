import React, { useState } from "react";
import { toast } from "react-toastify";

const TransactionModal = ({
  transactionType,
  friendId,
  setIsModalOpen,
  setTransactions,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
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

    try {
      const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${friendId}/add`;

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
        }),
      });

      const data = await res.json();
      console.log(data.transaction.sender);
      console.log(data.transaction._doc);
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

      // Update transactions locally if needed
      setTransactions((prev) => [
        ...prev,
        {
          amount: data.transaction._doc.amount,
          description: data.transaction._doc.description,
          transactionId: data.transaction._doc._id,
          createdAt: data.transaction._doc.createdAt,
          status: data.transaction._doc.status,
          sender: data.transaction.sender,
        },
      ]);
      setIsModalOpen(false);
      setAmount("");
      setDescription("");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 md:p-8 w-11/12 sm:w-96 space-y-6 md:space-y-8 shadow-lg max-w-lg">
        <h2 className="text-2xl font-semibold text-white text-center">
          {transactionType === "give" ? "You Gave" : "You Got"} Money
        </h2>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
            className="w-1/2 ml-2 bg-green-600 px-4 py-3 rounded-md text-white text-lg font-semibold hover:bg-green-700 transition duration-300"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
