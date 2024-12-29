import React, { useState } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Clock,
  Percent,
  CheckCircle,
} from "lucide-react";
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
];

export default function SplitExpense() {
  const [step, setStep] = useState("selectFriends");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("even");
  const [description, setDescription] = useState("");
  const [splits, setSplits] = useState({});
  const [error, setError] = useState("");

  const handleFriendSelection = (friend) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f.id === friend.id)
        ? prev.filter((f) => f.id !== friend.id)
        : [...prev, friend]
    );
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

  const handleInputChange = (friendId, value) => {
    const parsedValue = parseFloat(value);

    if (splitType === "percentage") {
      if (parsedValue > 100 || isNaN(parsedValue)) {
        setError(
          "Percentage for each friend must be less than or equal to 100."
        );
        return;
      }
      const updatedSplits = { ...splits, [friendId]: parsedValue };
      const totalPercentage = Object.values(updatedSplits).reduce(
        (acc, val) => acc + (isNaN(val) ? 0 : val),
        0
      );
      if (totalPercentage > 100) {
        setError("Total percentage cannot exceed 100.");
        return;
      }
      setSplits(updatedSplits);
      setError("");
    } else {
      setSplits({
        ...splits,
        [friendId]: isNaN(parsedValue) ? 0 : parsedValue,
      });
    }
  };

  const handleSubmit = () => {
    if (splitType === "percentage") {
      const totalPercentage = Object.values(splits).reduce(
        (acc, val) => acc + (isNaN(val) ? 0 : val),
        0
      );
      if (totalPercentage !== 100) {
        setError("Total percentage must equal 100.");
        return;
      }
    }
    setError("");
    alert("Split request submitted successfully!");
  };

  const renderFriendSelection = () => (
    <div className="w-full h-full bg-black border-gray-800 shadow-lg lg:rounded-l-3xl lg:rounded-r-none">
      <div className="p-6 text-center">
        <div className="text-2xl md:text-3xl font-bold text-blue-500">
          Select Friends
        </div>
      </div>
      <div className="space-y-8 p-6">
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter total amount"
            className="bg-gray-900 border-gray-800 text-white text-center text-3xl md:text-4xl h-16 md:h-20 rounded-lg"
            style={{ appearance: "textfield" }}
          />
        </div>
        {error && (
          <div className="text-red-500 text-center text-sm md:text-base">
            {error}
          </div>
        )}
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {friends.map((friend) => (
            <motion.div
              key={friend.id}
              className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 shadow-md ${
                selectedFriends.some((f) => f.id === friend.id)
                  ? "bg-blue-600 border border-blue-400"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
              onClick={() => handleFriendSelection(friend)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-12 w-12">
                <img src={friend.avatar} alt="" className="rounded-full" />
                {selectedFriends.some((f) => f.id === friend.id) && (
                  <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-lg font-medium">{friend.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full py-4 text-lg font-semibold shadow-lg transition-transform duration-200 hover:scale-105"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderSplitOptions = () => (
    <div className="w-full h-full bg-black lg:rounded-r-3xl lg:rounded-l-none">
      <div className="flex items-center justify-between p-6">
        <ArrowLeft
          className="h-6 w-6 cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
          onClick={() => setStep("selectFriends")}
        />
      </div>
      <div className="px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-gray-400 text-lg">Total</div>
          <div className="text-5xl md:text-6xl font-light text-white">
            ₹{amount}
          </div>
        </div>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="What's this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-800 text-center rounded-full px- py-1 text-sm md:text-base w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="flex justify-around border-b border-gray-800 pb-2">
          <button
            onClick={() => setSplitType("even")}
            className={`pb-2 px-4 transition-all duration-200 ${
              splitType === "even" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            ⚖️
          </button>
          <button
            onClick={() => setSplitType("amount")}
            className={`pb-2 px-4 transition-all duration-200 ${
              splitType === "amount" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            123
          </button>
          <button
            onClick={() => setSplitType("time")}
            className={`pb-2 px-4 transition-all duration-200 ${
              splitType === "time" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            <Clock className="h-6 w-6 md:h-8 md:w-8" />
          </button>
          <button
            onClick={() => setSplitType("percentage")}
            className={`pb-2 px-4 transition-all duration-200 ${
              splitType === "percentage" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            <Percent className="h-6 w-6 md:h-8 md:w-8" />
          </button>
        </div>
        <div className="space-y-0 ">
          {splitType === "even"
            ? "Split evenly"
            : splitType === "time"
            ? "split by shares"
            : splitType === "percentage"
            ? "split by percentage"
            : "split by amount"}
        </div>

        <div className="b-24 max-h-[calc(100vh-370px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={splitType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                {selectedFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12">
                          <img
                            src={friend.avatar}
                            alt=""
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-base md:text-lg text-white">
                        {friend.name}
                      </span>
                    </div>
                    <div>
                      {splitType === "even" ? (
                        `₹${(amount / selectedFriends.length).toFixed(2)}`
                      ) : (
                        <input
                          type="number"
                          className="bg-gray-900 text-center rounded-lg px-3 mr-2 py-1 text-sm w-24 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={splits[friend.id] || ""}
                          onChange={(e) =>
                            handleInputChange(friend.id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="w-full fixed bottom-0 right-0 p-3 bg-black border-t border-gray-800">
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <button
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 text-lg font-semibold rounded-full shadow-lg transition-transform duration-200 hover:scale-105"
          onClick={handleSubmit}
        >
          Submit Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-stretch justify-center">
      <AnimatePresence mode="wait">
        {step === "selectFriends" ? (
          <motion.div
            key="friendSelection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-1/2 h-screen overflow-y-auto"
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
            className="w-full lg:w-1/2 h-screen overflow-y-auto"
          >
            {renderSplitOptions()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
