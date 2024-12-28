import React, { useState } from "react";
import { ArrowLeft, MoreVertical, Clock, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const friends = [
  {
    id: 1,
    name: "You",
    avatar: "https://i.pravatar.cc/150?img=1",
    initial: "Y",
  },
  {
    id: 2,
    name: "Meet Vaghela",
    avatar: "https://i.pravatar.cc/150?img=2",
    initial: "M",
  },
  {
    id: 3,
    name: "Vivek Parmar",
    avatar: "https://i.pravatar.cc/150?img=3",
    initial: "V",
  },
  {
    id: 4,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=4",
    initial: "J",
  },
];

export default function SplitExpense() {
  const [step, setStep] = useState("selectFriends");

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("even");
  const [description, setDescription] = useState("");
  const [splits, setSplits] = useState({});

  const handleFriendSelection = (friend) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f.id === friend.id)
        ? prev.filter((f) => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const renderFriendSelection = () => (
    <dv className="w-full h-full bg-black border-gray-800 shadow-lg lg:rounded-l-3xl lg:rounded-r-none">
      <div className="p-6">
        <div className="text-2xl md:text-3xl font-bold text-white">
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

        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {friends.map((friend) => (
            <motion.div
              key={friend.id}
              className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedFriends.some((f) => f.id === friend.id)
                  ? "bg-gray-800"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
              onClick={() => handleFriendSelection(friend)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-12 w-12">
                <img src={friend.avatar} alt="" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg">{friend.name}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedFriends.some((f) => f.id === friend.id)}
                className="border-gray-600 h-5 w-5"
              />
            </motion.div>
          ))}
        </div>

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-semibold transition-colors duration-200"
          onClick={() => setStep("splitOptions")}
          disabled={selectedFriends.length === 0 || !amount}
        >
          Continue
        </button>
      </div>
    </dv>
  );

  const renderSplitOptions = () => (
    <div className="w-full h-full bg-black lg:rounded-r-3xl lg:rounded-l-none">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <ArrowLeft
          className="h-6 w-6 cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
          onClick={() => setStep("selectFriends")}
        />
        <MoreVertical className="h-6 w-6 text-gray-400" />
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-8">
        {/* Total Amount */}
        <div className="text-center space-y-2">
          <div className="text-gray-400 text-lg">Total</div>
          <div className="text-5xl md:text-6xl font-light">₹{amount}</div>
        </div>

        {/* Description Input */}
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="What's this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-900 text-center rounded-full px-6 py-3 text-sm md:text-base w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        {/* Split Type Selection */}
        <div className="flex justify-around border-b border-gray-800 pb-2">
          <button
            onClick={() => setSplitType("even")}
            className={`pb-2 px-4 transition-all duration-200 ${
              splitType === "even" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            <div className="text-2xl md:text-3xl">⚖️</div>
          </button>
          <button
            onClick={() => setSplitType("amount")}
            className={`pb-2 px-4 transition-all duration-200 ${
              splitType === "amount" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            <div className="text-2xl md:text-3xl">123</div>
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

        {/* Split Content */}
        <div className="pb-24 max-h-[calc(100vh-400px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={splitType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                <div className="text-sm md:text-base text-gray-400 capitalize">
                  {splitType === "even"
                    ? "Split evenly"
                    : splitType === "amount"
                    ? "Split by amounts"
                    : splitType === "percentage"
                    ? "Split by percentages"
                    : "Split by time"}
                </div>
                {selectedFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12">
                          <img src={friend.avatar} alt="" />
                        </div>
                        <div className="absolute -top-1 -left-1">
                          <div className="h-4 w-4 rounded-full border-2 border-black bg-blue-500" />
                        </div>
                      </div>
                      <span className="text-base md:text-lg">
                        {friend.name}
                      </span>
                    </div>
                    {splitType === "even" ? (
                      <div className="text-base md:text-lg font-medium">
                        ₹
                        {(parseFloat(amount) / selectedFriends.length).toFixed(
                          2
                        )}
                      </div>
                    ) : splitType === "percentage" ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="w-20 bg-transparent text-right text-base md:text-lg"
                          value={splits[friend.id] || "0.00"}
                          onChange={(e) =>
                            setSplits({
                              ...splits,
                              [friend.id]: e.target.value,
                            })
                          }
                          style={{ appearance: "textfield" }}
                        />
                        <span className="ml-1 text-base md:text-lg">%</span>
                      </div>
                    ) : (
                      <input
                        type="number"
                        className="w-24 bg-transparent text-right text-base md:text-lg"
                        value={splits[friend.id] || ""}
                        onChange={(e) =>
                          setSplits({ ...splits, [friend.id]: e.target.value })
                        }
                        placeholder="0"
                        style={{ appearance: "textfield" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 max-w-md mx-auto lg:relative lg:p-0 lg:mt-8">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-semibold transition-colors duration-200">
          Send request
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
