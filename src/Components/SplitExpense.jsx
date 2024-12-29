import React, { useState, useEffect } from "react";
import { Menu, DollarSign, Percent, CheckCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const friends = [
  { id: 1, name: "You", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Meet Vaghela", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Vivek Parmar", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 5, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 6, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 7, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 8, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 9, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=4" },
];

export default function ImprovedSplitExpense() {
  const [step, setStep] = useState("selectFriends");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("even");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [splitValues, setSplitValues] = useState({});

  useEffect(() => {
    if (splitType === "even" && amount && selectedFriends.length > 0) {
      const evenSplit = (parseFloat(amount) / selectedFriends.length).toFixed(
        2
      );
      const newSplitValues = {};
      selectedFriends.forEach((friend) => {
        newSplitValues[friend.id] = evenSplit;
      });
      setSplitValues(newSplitValues);
    }
  }, [splitType, amount, selectedFriends]);

  const handleFriendSelection = (friend) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f.id === friend.id)
        ? prev.filter((f) => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const handleSplitInput = (id, value) => {
    setSplitValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleContinue = () => {
    if (!amount) {
      setError("Please enter an amount.");
      return;
    }
    if (selectedFriends.length < 2) {
      setError("Please select at least two friends.");
      return;
    }
    setError("");
    setStep("splitOptions");
  };

  const handleSubmit = () => {
    if (splitType !== "even") {
      const totalSplit = Object.values(splitValues).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      );

      if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
        setError("Split values do not add up to the total amount.");
        return;
      }
    }
    console.log({
      description,
      amount,
      splitType,
      selectedFriends,
      splitValues,
    });
    alert("Split request submitted successfully!");
    // Reset the form
    setStep("selectFriends");
    setSelectedFriends([]);
    setAmount("");
    setSplitType("even");
    setDescription("");
    setSplitValues({});
  };

  const renderFriendSelection = () => (
    <div className="w-full h-full bg-black text-white">
      <div className="p-4 text-center">
        <div className="text-xl font-semibold text-blue-500 font-sans">
          Split Expense
        </div>
      </div>
      <div className="space-y-6 p-4">
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter total amount"
            className="bg-gray-900 border border-gray-800 text-white text-center text-2xl rounded-lg p-4 w-full font-sans"
          />
        </div>
        {error && (
          <div className="text-red-500 text-center text-sm font-sans">
            {error}
          </div>
        )}
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {friends.map((friend) => (
            <motion.div
              key={friend.id}
              className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer ${
                selectedFriends.some((f) => f.id === friend.id)
                  ? "bg-gray-800"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
              onClick={() => handleFriendSelection(friend)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-12 w-12">
                <img src={friend.avatar} alt="" className="rounded-full" />
                {selectedFriends.some((f) => f.id === friend.id) && (
                  <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-blue-500 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-lg font-sans">{friend.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 text-base font-medium font-sans transition duration-300 ease-in-out"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderSplitOptions = () => (
    <div className="w-full h-full bg-black text-white">
      <div className="pt-20 px-4 space-y-6 pb-24">
        <div className="text-center space-y-1">
          <div className="text-gray-400 text-sm font-sans">Total</div>
          <div className="text-4xl font-light text-white font-sans">
            ₹{amount}
          </div>
        </div>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="What's this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-900 text-center rounded-3xl px-2 py-1 text-base w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans placeholder-gray-500"
          />
        </div>
        <div className="flex justify-around pb-2 border-b border-gray-800">
          <button
            onClick={() => setSplitType("even")}
            className={`text-sm flex flex-col items-center ${
              splitType === "even" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <span className="text-2xl mb-1">⚖️</span>
            <span className="font-sans">Even</span>
          </button>
          <button
            onClick={() => setSplitType("amount")}
            className={`text-sm flex flex-col items-center ${
              splitType === "amount" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <DollarSign className="h-6 w-6 mb-1" />
            <span className="font-sans">Amount</span>
          </button>
          <button
            onClick={() => setSplitType("shares")}
            className={`text-sm flex flex-col items-center ${
              splitType === "shares" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Users className="h-6 w-6 mb-1" />
            <span className="font-sans">Shares</span>
          </button>
          <button
            onClick={() => setSplitType("percentage")}
            className={`text-sm flex flex-col items-center ${
              splitType === "percentage" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Percent className="h-6 w-6 mb-1" />
            <span className="font-sans">Percent</span>
          </button>
        </div>
        <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={splitType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-4 bg-gray-900 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12">
                      <img
                        src={friend.avatar}
                        alt=""
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-base text-white font-sans">
                      {friend.name}
                    </span>
                  </div>
                  {splitType !== "even" ? (
                    <input
                      type={splitType === "percentage" ? "number" : "text"}
                      value={splitValues[friend.id] || ""}
                      onChange={(e) =>
                        handleSplitInput(friend.id, e.target.value)
                      }
                      className="bg-gray-800 text-white text-base w-24 rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      placeholder={
                        splitType === "percentage"
                          ? "%"
                          : splitType === "shares"
                          ? "Shares"
                          : "Amount"
                      }
                    />
                  ) : (
                    <span className="text-base text-white font-sans">
                      ₹{(amount / selectedFriends.length).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-black p-4">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-medium font-sans rounded-lg transition duration-300 ease-in-out"
          onClick={handleSubmit}
        >
          Submit Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-stretch justify-center">
      <AnimatePresence mode="wait">
        {step === "selectFriends" ? (
          <motion.div
            key="friendSelection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-screen overflow-y-auto"
          >
            {renderFriendSelection()}
          </motion.div>
        ) : (
          <motion.div
            key="splitOptions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-screen overflow-y-auto"
          >
            {renderSplitOptions()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
