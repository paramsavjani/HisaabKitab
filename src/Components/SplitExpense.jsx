import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { CheckCircle, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";
import UserContext from "../context/UserContext";
import { App } from "@capacitor/app";
// import equal from "../assets/icons/balance (1).png";
import percentage from "../assets/icons/money-bag.png";
import sharing from "../assets/icons/sharing.png";
import money from "../assets/icons/dollar.png";

export default function ImprovedSplitExpense() {
  const [step, setStep] = useState("enterAmount");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [amount, setAmount] = useState("0");
  const [splitType, setSplitType] = useState("even");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [splitValues, setSplitValues] = useState({});
  const [isSetValue, setIsSetValue] = useState({});
  const amountInputRef = useRef(null);
  const { activeFriends, user } = useContext(UserContext);

  const activeFriendsForSplit = useMemo(
    () => [{ ...user, name: "You", username: undefined }, ...activeFriends],
    [user, activeFriends]
  );

  useEffect(() => {
    if (activeFriendsForSplit.length === 0) {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [activeFriendsForSplit]);

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
          } else if (step === "enterAmount") {
            window.history.pushState({}, "", "/dashboard");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }
        } else {
          App.exitApp();
        }
      }
    );

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
    alert("Split request submitted successfully!");
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
    setStep("enterAmount");
    setSelectedFriends([]);
    setAmount("");
    setSplitType("even");
    setDescription("");
    setSplitValues({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  const renderAmountInput = () => (
    <div className="w-full h-screen bg-black text-white flex flex-col justify-center items-center relative">
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
                if (input === "0" || input === "") return "";
                if (input[0] === "0") {
                  input = input.slice(1);
                }
                if (input[0] === ".") {
                  input = "0" + input;
                }
                if (input.includes(".")) {
                  const [whole, decimal] = input.split(".");
                  input = `${whole}.${decimal.slice(0, 2)}`;
                }
                if (/[^0-9.]/.test(input)) return a;
                if ((input.match(/\./g) || []).length > 1) return a;
                if (input.split(".")[0].length > 6) return a;
                return input;
              });
            }}
            onKeyDown={handleKeyPress}
            className="bg-transparent kranky-regular border-none text-white text-center text-6xl w-full font-bold focus:outline-none"
          />
          {error && (
            <div className="text-red-500 text-center text-sm font-sans mt-2">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md p-4 pb-0 fixed bottom-3">
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
        <div className="kalam-bold text-transparent bg-gradient-to-r from-blue-400 bg-clip-text to-green-400 text-4xl pt-2 font-semibold font-sans flex-grow text-center">
          हिस्सेदार Kaun?
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
          {activeFriendsForSplit.map((friend) => (
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
                <p className={`text-white text-xl lobster-regular`}>
                  {friend.name}
                </p>
                <p className="text-green-600 text-md teko-regular">
                  {friend.username ? `@${friend.username}` : ""}
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
      <div className="flex-shrink-0 pt-14">
        <div className="px-4 space-y-3">
          <div className="text-center space-y-1">
            <div className="text-5xl kranky-regular font-bold text-white font-sans">
              ₹{parseFloat(amount).toFixed(2)}
            </div>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setDescription(e.target.value);
                }
              }}
              // maxLength={30}
              className="bg-gray-800 merienda-regular text-center rounded-2xl px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all duration-300"
              style={{
                width: `${Math.max(16, description.length)}ch`,
              }}
            />
          </div>
        </div>
        <div className="flex justify-around pb-1 mt-5">
          {[
            { type: "even", icon: "⚖️", label: "Even", isTextIcon: true },
            { type: "amount", icon: money, label: "Amount", isImage: true },
            { type: "shares", icon: sharing, label: "Shares", isImage: true },
            {
              type: "percentage",
              icon: percentage,
              label: "Percent",
              isImage: true,
            },
          ].map(({ type, icon, label, isTextIcon }) => (
            <button
              key={type}
              onClick={() => setSplitType(type)}
              className={`relative text-sm flex flex-col items-center space-y-1 ${
                splitType === type ? "text-blue-500" : "text-gray-400"
              } group transition-all duration-300`}
            >
              {isTextIcon ? (
                <span className="text-2xl">{icon}</span>
              ) : (
                <img src={icon} className="w-7 h-7" alt={type} />
              )}
              <span className="text-xs font-sans">{label}</span>
              {/* Animated Underline */}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 transform transition-transform duration-300 ${
                  splitType === type
                    ? "scale-x-100 bg-blue-500"
                    : "scale-x-0 bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="text-lg text-center pt-2 pb-0 border-separate border-t border-gray-700 font-semibold text-white mb-2">
          {splitType === "even"
            ? "Split Evenly"
            : splitType === "amount"
            ? "Split by Amount"
            : splitType === "shares"
            ? "Split by Shares"
            : "Split by Percentage"}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto  px-4 pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={splitType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {selectedFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between gap-4 bg-gray-800 p-3 rounded-lg shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10">
                    <img
                      src={
                        friend.profilePicture ||
                        "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                      }
                      alt=""
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-md merienda-regular text-white font-sans">
                      {friend.name}
                    </span>
                    <span
                      className={`text-sm ${
                        splitType === "shares"
                          ? "merienda-regular text-green-500"
                          : ""
                      } font-sans`}
                    >
                      {splitType === "shares"
                        ? `₹${(
                            ((splitValues[friend._id] || "1") /
                              selectedFriends.reduce(
                                (acc, f) =>
                                  acc + parseInt(splitValues[f._id] || "1"),
                                0
                              )) *
                            amount
                          ).toFixed(2)}`
                        : ""}
                    </span>
                  </div>
                </div>
                {splitType === "even" ? (
                  <span className="text-md kranky-regular font-semibold text-green-500">
                    ₹{(amount / selectedFriends.length).toFixed(2)}
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
                      className="bg-gray-700 text-white rounded-full mr-1 px-1 py-1 focus:outline-none hover:bg-gray-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={splitValues[friend._id] || "1"}
                      className="bg-gray-800 text-white text-center w-8 py-1 focus:outline-none rounded-md"
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
                      className="bg-gray-700 text-white px-1 py-1 ml-1 rounded-full focus:outline-none hover:bg-gray-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : splitType === "amount" ? (
                  <div className="flex items-center text-green-500">
                    <span className="mr-0 text-lg">₹</span>
                    <input
                      type="number"
                      value={splitValues[friend._id] || ""}
                      onChange={(e) => {
                        let input = e.target.value;
                        if (input === "0" || input === "");
                        if (input[0] === "0") {
                          input = input.slice(1);
                        }
                        if (input.includes(".")) {
                          const [whole, decimal] = input.split(".");
                          input = `${whole}.${decimal.slice(0, 2)}`;
                        }
                        if (/[^0-9.]/.test(input)) return;
                        if ((input.match(/\./g) || []).length > 1) return;
                        if (parseFloat(input) > parseFloat(amount)) return;

                        let totalSplit = Object.values(splitValues).reduce(
                          (sum, val) => sum + parseFloat(val || 0),
                          0
                        );

                        console.log("totalSplit", totalSplit);

                        totalSplit -= parseFloat(splitValues[friend._id] || 0);

                        console.log("final total split", totalSplit);

                        if (totalSplit + parseFloat(input) > parseFloat(amount))
                          return;

                        if (input.split(".")[0].length > 6) return;

                        setIsSetValue[friend._id] = true;

                        const totalUnChanged =
                          selectedFriends.length -
                          Object.keys(isSetValue).length;

                        const remainingAmount = parseFloat(amount) - input;

                        const newValue =
                          parseFloat(remainingAmount) / totalUnChanged;

                        console.log(newValue);

                        selectedFriends.forEach((f) => {
                          if (!isSetValue[f._id]) {
                            setSplitValues((prev) => ({
                              ...prev,
                              [f._id]: newValue.toFixed(2),
                            }));
                          }
                        });

                        handleSplitInput(friend._id, input);
                      }}
                      className="bg-gray-800 text-green-500 kranky-regular text-lg font-semibold w-16 px-1 py-1 focus:outline-none"
                      placeholder="0.00"
                    />
                    {splitType === "percentage" && (
                      <span className="ml-1">%</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    {splitType !== "percentage" && (
                      <span className="mr-0">₹</span>
                    )}
                    <input
                      type="number"
                      value={splitValues[friend._id] || ""}
                      onChange={(e) =>
                        handleSplitInput(friend._id, e.target.value)
                      }
                      className="bg-gray-800 text-white kranky-regular font-semibold w-16 px-2 py-1 focus:outline-none"
                      placeholder={splitType === "percentage" ? "%" : ""}
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
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-sm font-medium font-sans rounded-lg transition duration-300 ease-in-out shadow-md"
          onClick={handleSubmit}
        >
          Submit Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-black text-white flex flex-col items-stretch justify-center">
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
