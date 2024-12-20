import React from "react";

const TransactionModal = ({
  onClose,
  onSubmit,
  transactionType,
  description,
  setDescription,
  amount,
  setAmount,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 space-y-4">
        <h2 className="text-xl font-bold text-white">
          {transactionType === "give" ? "You Gave" : "You Got"} Money
        </h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full p-2 bg-gray-700 text-white rounded-md outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full p-2 bg-gray-700 text-white rounded-md outline-none"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-red-600 px-4 py-2 rounded-md text-white hover:bg-red-700"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-green-600 px-4 py-2 rounded-md text-white hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
export default TransactionModal;
