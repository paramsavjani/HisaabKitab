import React, { useState, useEffect, useRef, useContext } from "react";
import {
  ArrowLeft,
  DollarSign,
  Percent,
  CheckCircle,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";
import UserContext from "../context/UserContext";
import { App } from "@capacitor/app";

export default function ImprovedSplitExpense() {
  const [step, setStep] = useState("enterAmount");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [amount, setAmount] = useState("0");
  const [splitType, setSplitType] = useState("even");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [splitValues, setSplitValues] = useState({});
  const amountInputRef = useRef(null);
  const { activeFriends } = useContext(UserContext);

  useEffect(() => {
    if (activeFriends.length === 0) {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [activeFriends]);

  useEffect(() => {
    if (step === "splitExpense" || step === "selectFriends") {
      window.isOnSplitExpense = true;
    } else {
      window.isOnSplitExpense = false;
    }

    return () => {
      window.isOnSplitExpense = false;
    };
  }, [step]);

  useEffect(() => {
    const backButtonListener = App.addListener(
      "backButton",
      ({ canGoBack }) => {
        if (canGoBack) {
          if (step === "splitExpense") {
            setStep("selectFriends");
          } else if (step === "selectFriends") {
            setStep("enterAmount");
          } else {
            window.history.back();
          }
        } else {
          App.exitApp();
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      backButtonListener.then((listener) => listener.remove());
    };
  }, [step]);

  useEffect(() => {
    if (step === "enterAmount" && amountInputRef.current) {
      amountInputRef.current.focus();
    }
    setError("");
  }, [step]);

  useEffect(() => {
    if (splitType === "even" && amount && selectedFriends.length > 0) {
      const evenSplit = (parseFloat(amount) / selectedFriends.length).toFixed(
        2
      );
      const newSplitValues = {};
      selectedFriends.forEach((friend) => {
        newSplitValues[friend._id] = evenSplit;
      });
      setSplitValues(newSplitValues);
    } else if (splitType === "percentage") {
      const newSplitValues = {};
      const evenPercentage = (100 / selectedFriends.length).toFixed(2);
      selectedFriends.forEach((friend) => {
        newSplitValues[friend._id] = evenPercentage;
      });
      setSplitValues(newSplitValues);
    } else {
      setSplitValues({});
    }
  }, [splitType, amount, selectedFriends]);

  const handleFriendSelection = (friend) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f._id === friend._id)
        ? prev.filter((f) => f._id !== friend._id)
        : [...prev, friend]
    );
  };

  const handleSplitInput = (_id, value) => {
    if (splitType === "percentage") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) return;
      setSplitValues({ ...splitValues, [_id]: value });
    } else if (splitType === "shares") {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) return;
      setSplitValues({ ...splitValues, [_id]: numValue.toString() });
    } else {
      setSplitValues({ ...splitValues, [_id]: value });
    }
  };

  const handleContinue = () => {
    if (step === "enterAmount") {
      if (!amount) {
        setError("Please enter an amount.");
        setTimeout(() => setError(""), 800);
        return;
      }
      if (parseFloat(amount) <= 0) {
        setError("Amount must be greater than zero.");
        setTimeout(() => setError(""), 800);
        return;
      }
      if (parseFloat(amount) > 1000000) {
        setError("Amount must be less than 1,000,000.");
        setTimeout(() => setError(""), 800);
        return;
      }
      if (isNaN(amount)) {
        setError("Amount must be a number.");
        setTimeout(() => setError(""), 800);
        return;
      }
      setError("");
      setStep("selectFriends");
    } else if (step === "selectFriends") {
      if (selectedFriends.length < 1) {
        setError("Please select at least one friend.");
        return;
      }
      setError("");
      setStep("splitExpense");
    }
  };

  const handleSubmit = () => {
    if (splitType === "percentage") {
      const totalPercentage = Object.values(splitValues).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setError("Total percentage must equal 100%.");
        return;
      }
    } else if (splitType !== "even") {
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
    setStep("enterAmount");
    setSelectedFriends([]);
    setAmount("");
    setSplitType("even");
    setDescription("");
    setSplitValues({});
  };

  // Handle keyboard 'Enter' or 'Next' key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  const renderAmountInput = () => (
    <div className="w-full h-screen bg-black text-white flex flex-col justify-center items-center relative">
      {/* Input Field */}
      <div className="flex-grow flex items-center justify-center w-full p-4">
        <div className="w-full max-w-md">
          <input
            ref={amountInputRef}
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount((a) => {
                let input = e.target.value;

                console.log(e.target.value);

                // Allow empty input or a single zero "0"
                if (input === "0" || input === "") return "";

                if (input[0] === "0") {
                  input = input.slice(1);
                }

                if (input[0] === ".") {
                  input = "0" + input;
                }

                // Prevent multiple dots or any non-numeric characters (except for the dot)
                if (/[^0-9.]/.test(input)) return a;

                // Ensure there's only one dot in the input
                if ((input.match(/\./g) || []).length > 1) return a;

                // Limit input to 10 digits in total (before and after the dot)
                if (input.replace(".", "").length > 6) return a;

                return input;
              });
            }}
            onKeyDown={handleKeyPress} // Keyboard event listener
            className="bg-transparent kranky-regular border-none text-white text-center text-6xl w-full font-bold focus:outline-none"
          />
          {error && (
            <div className="text-red-500 text-center text-sm font-sans mt-2">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Continue Button (Sticky above keyboard) */}
      <div className="w-full max-w-md p-4 pb-0 fixed bottom-2">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-1 text-2xl  merienda-regular transition duration-300 ease-in-out"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderFriendSelection = () => (
    <div className="w-full h-full bg-black text-white">
      <div className="p-4 flex items-center">
        <button
          onClick={() => setStep("enterAmount")}
          className="text-blue-500 hover:text-blue-400 transition-colors duration-200 flex items-center"
        ></button>
        <div className="merienda-regular text-transparent bg-gradient-to-r from-blue-400 bg-clip-text to-green-400 text-3xl pt-2 font-semibold font-sans flex-grow text-center">
          Select Friends
        </div>
      </div>
      <div className="p-4">
        <div className=" p- mb-4">
          <div className="kranky-regular text-5xl font-semibold text-white font-sans text-center">
            ₹{amount}
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-center text-sm font-sans mb-4">
            {error}
          </div>
        )}
        <div className="space-y-1 max-h-[calc(100vh-215px)] overflow-y-auto mb-4">
          {activeFriends.map((friend) => (
            <motion.div
              key={friend._id}
              className={`flex items-center space-x-4 p-4 py-3 rounded-lg cursor-pointer ${
                selectedFriends.some((f) => f._id === friend._id)
                  ? "bg-gray-800"
                  : "bg-gray-900"
              }`}
              onClick={() => handleFriendSelection(friend)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-12 w-12">
                <img
                  src={
                    friend.profilePicture ||
                    "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                  }
                  alt=""
                  className="rounded-full"
                />
                {selectedFriends.some((f) => f._id === friend._id) && (
                  <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-white-600 bg-blue-500 rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-lg lobster-regular">
                  {friend.name}
                </p>
                <p className="text-green-600 text-md teko-regular">
                  @{friend.username}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <button
          className="w-full md:max-w-[calc(100%-350px)] max-w-[calc(100%-30px)] merienda-regular fixed bottom-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-1 text-2xl transition duration-300 ease-in-out"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderSplitOptions = () => (
    <div className="w-full h-full bg-black text-white flex flex-col">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={() => setStep("selectFriends")}
            className="md:flex hidden text-blue-500 hover:text-blue-400 transition-colors duration-200 items-center"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
        </div>
        <div className="px-4 space-y-4">
          <div className="text-center space-y-1">
            <div
              className="text-6xl font-bold text-white font-sans"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              ₹{amount}
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <input
              type="text"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setDescription(e.target.value);
                }
              }}
              maxLength={30}
              className="bg-gray-900 text-center rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans placeholder-gray-500 transition-all duration-300"
              style={{
                width: `${Math.max(10, Math.min(30, description.length))}ch`,
              }}
            />
          </div>
        </div>
        <div className="flex justify-around pb-2 border-b border-gray-800 mt-4">
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
              splitType === "amount" ? "text-blue-500" : "te0xt-gray-400"
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
      </div>
      <div className="flex-grow overflow-y-auto px-4 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={splitType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {selectedFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between gap-4 bg-gray-900 p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12">
                    <img src={friend.avatar} alt="" className="rounded-full" />
                  </div>
                  <span className="text-base text-white font-sans">
                    {friend.name}
                  </span>
                </div>
                {splitType === "even" ? (
                  <span className="text-base text-white font-sans">
                    ₹{(amount / selectedFriends.length0).toFixed(2)}
                  </span>
                ) : splitType === "shares" ? (
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        handleSplitInput(
                          friend._id,
                          Math.max(
                            1,
                            parseInt(splitValues[friend._id] || "1") - 1
                          ).toString()
                        )
                      }
                      className="bg-gray-800 text-white px-2 py-1 rounded-l focus:outline-none"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={splitValues[friend._id] || "1"}
                      onChange={(e) =>
                        handleSplitInput(friend._id, e.target.value)
                      }
                      className="bg-gray-800 text-white text-center w-12 py-1 focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() =>
                        handleSplitInput(
                          friend._id,
                          (
                            parseInt(splitValues[friend._id] || "1") + 1
                          ).toString()
                        )
                      }
                      className="bg-gray-800 text-white px-2 py-1 rounded-r focus:outline-none"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {splitType !== "percentage" && (
                      <span className="mr-2">₹</span>
                    )}
                    <input
                      type="number"
                      value={splitValues[friend._id] || ""}
                      onChange={(e) =>
                        handleSplitInput(friend._id, e.target.value)
                      }
                      className="bg-gray-800 text-white text-base w-24 rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      placeholder={splitType === "percentage" ? "%" : "Amount"}
                    />
                    {splitType === "percentage" && (
                      <span className="ml-1">%</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0 p-4">
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
        {step === "enterAmount" ? (
          <motion.div
            key="amountInput"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-screen overflow-y-auto"
          >
            {renderAmountInput()}
          </motion.div>
        ) : step === "selectFriends" ? (
          <motion.div
            key="friendSelection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
