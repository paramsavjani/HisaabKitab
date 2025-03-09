"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, Send, Calculator, Check, Info, AlertCircle } from "lucide-react"
import UserContext from "../context/UserContext.js"
import socket from "../socket.js"

const TransactionModal = ({
  transactionType,
  setIsModalOpen,
  setFriendTransactions,
  friend,
  setTransactions,
  setActiveFriends,
}) => {
  const [amount, setAmount] = useState("")
  const [calculatedAmount, setCalculatedAmount] = useState(null)
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCalculation, setShowCalculation] = useState(false)
  const [calculationResult, setCalculationResult] = useState("")
  const [calculationError, setCalculationError] = useState("")
  const [amountError, setAmountError] = useState("")
  const [isClosing, setIsClosing] = useState(false)
  const { accessToken, refreshToken } = React.useContext(UserContext)
  const amountInputRef = useRef(null)
  const modalRef = useRef(null)
  const expressionRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    // Make modal visible immediately without any animation delay
    if (modalRef.current) {
      modalRef.current.classList.add("modal-active")
    }
    if (backdropRef.current) {
      backdropRef.current.classList.add("backdrop-active")
    }

    // Focus immediately with no delay
    if (amountInputRef.current) {
      amountInputRef.current.focus()
    }

    // Close modal on escape key
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    document.body.style.overflow = "hidden" // Prevent scrolling behind modal

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "" // Restore scrolling
    }
  }, [])

  // Parse and evaluate mathematical expressions
  const evaluateExpression = (expr) => {
    try {
      // Replace × with * and ÷ with /
      expr = expr.replace(/×/g, "*").replace(/÷/g, "/")

      // Security check - only allow numbers and basic operators
      if (!/^[0-9+\-*/.()\s]*$/.test(expr)) {
        throw new Error("Invalid characters in expression")
      }

      // eslint-disable-next-line no-eval
      const result = eval(expr)

      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid calculation result")
      }

      return Number.parseFloat(result.toFixed(2))
    } catch (error) {
      console.error("Calculation error:", error)
      return null
    }
  }

  // Handle amount input change with calculation support
  const handleAmountChange = (e) => {
    const value = e.target.value
    setAmount(value)

    // Clear any previous errors
    setAmountError("")
    setCalculationError("")

    // Check if the input contains any mathematical operators
    if (/[+\-*/×÷]/.test(value)) {
      const result = evaluateExpression(value)
      setCalculatedAmount(result)

      if (result !== null) {
        setCalculationResult(`= ₹${result.toFixed(2)}`)
        setShowCalculation(true)
        setCalculationError("")
      } else {
        setCalculationResult("")
        setCalculationError("Invalid calculation")
        setShowCalculation(true)
      }
    } else {
      setCalculatedAmount(null)
      setShowCalculation(false)
      setCalculationError("")
    }
  }

  // Apply the calculated result to the amount field
  const applyCalculation = () => {
    if (calculatedAmount !== null) {
      setAmount(calculatedAmount.toString())
      setShowCalculation(false)
      setCalculatedAmount(null)
      setCalculationError("")

      // Add a subtle animation to the input but without timeout
      if (amountInputRef.current) {
        amountInputRef.current.classList.add("pulse-animation")
        // Remove the class immediately after the next render
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (amountInputRef.current) {
              amountInputRef.current.classList.remove("pulse-animation")
            }
          })
        })
      }
    }
  }

  const handleClose = () => {
    // Prevent multiple close attempts
    if (isClosing) return
    setIsClosing(true)

    // Close immediately without waiting for animation
    setIsModalOpen(false)
  }

  const handleSubmit = async () => {
    // Clear previous errors
    setAmountError("")

    // If there's a calculation pending, apply it first
    let finalAmount = amount
    if (calculatedAmount !== null) {
      finalAmount = calculatedAmount.toString()
      setAmount(finalAmount)
      setShowCalculation(false)
    }

    // Validate amount
    if (!finalAmount || isNaN(finalAmount) || Number.parseFloat(finalAmount) <= 0) {
      setAmountError("Please enter a valid amount")

      // Highlight the input field without timeout
      if (amountInputRef.current) {
        amountInputRef.current.classList.add("error-shake")
        // Remove the class immediately after the animation would complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (amountInputRef.current) {
              amountInputRef.current.classList.remove("error-shake")
            }
          })
        })
      }
      return
    }

    setIsLoading(true)

    try {
      const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${friend.username}/add`

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount:
            transactionType === "give"
              ? Math.abs(Number.parseFloat(finalAmount))
              : -Math.abs(Number.parseFloat(finalAmount)),
          description,
          accessToken,
          refreshToken,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setAmountError(data.message || "Something went wrong. Please try again.")
        setIsLoading(false)
        return
      }

      handleClose()

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
      })

      setFriendTransactions((prev) => [
        ...prev,
        {
          amount: data.transaction._doc.amount,
          description: data.transaction._doc.description,
          _id: data.transaction._doc._id,
          createdAt: data.transaction._doc.createdAt,
          status: data.transaction._doc.status,
          sender: data.transaction._doc.sender,
          receiver: data.transaction._doc.receiver,
        },
      ])

      setTransactions((prev) => [
        ...prev,
        {
          amount: data.transaction._doc.amount,
          description: data.transaction._doc.description,
          _id: data.transaction._doc._id,
          createdAt: data.transaction._doc.createdAt,
          status: data.transaction._doc.status,
          sender: data.transaction._doc.sender,
          receiver: data.transaction._doc.receiver,
        },
      ])

      setActiveFriends((prev) => {
        const updatedFriends = [...prev]
        const friendIndex = updatedFriends.findIndex((f) => f.username === friend.username)
        updatedFriends[friendIndex].lastTransactionTime = data.transaction._doc.createdAt
        return updatedFriends
      })

      setAmount("")
      setDescription("")
    } catch (err) {
      console.error(err.message)
      setAmountError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle "Enter" key press to submit the form
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (showCalculation && calculatedAmount !== null) {
        e.preventDefault()
        applyCalculation()
      } else {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  // Add CSS for animations and styling
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .modal-container {
        opacity: 0;
        transform: scale(0.98);
        transition: all 0.05s linear;
        will-change: opacity, transform;
      }
      
      .modal-active {
        opacity: 1;
        transform: scale(1);
      }
      
      .modal-exit {
        display: none;
      }
      
      .modal-backdrop {
        backdrop-filter: blur(8px);
        background-color: rgba(0, 0, 0, 0.7);
      }
      
      .backdrop-active {
        backdrop-filter: blur(8px);
        background-color: rgba(0, 0, 0, 0.7);
      }
      
      .backdrop-exiting {
        display: none;
      }
      
      .input-focus-ring {
        transition: all 0.2s ease;
        border: 1px solid rgba(59, 130, 246, 0.1);
      }
      
      .input-focus-ring:focus {
        border-color: transparent;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
      }
      
      .amount-input-container {
        position: relative;
      }
      
      .amount-input-container::before {
        content: '₹';
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        font-size: 1.25rem;
      }
      
      .amount-input {
        padding-left: 30px !important;
      }
      
      .calculation-result {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #10b981;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        background: rgba(16, 185, 129, 0.1);
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .calculation-result:hover {
        background: rgba(16, 185, 129, 0.2);
      }
      
      .calculation-error {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #ef4444;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        background: rgba(239, 68, 68, 0.1);
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .calculator-tip {
        opacity: 1;
      }
      
      .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .pulse-animation {
        animation: pulse 0.5s ease-in-out;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        50% { transform: translateX(4px); }
        75% { transform: translateX(-4px); }
      }
      
      .error-shake {
        animation: shake 0.3s ease-in-out;
        border-color: #ef4444 !important;
      }
      
      .calculator-icon {
        color: #9ca3af;
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .input-error {
        border-color: #ef4444 !important;
        background-color: rgba(239, 68, 68, 0.05) !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 modal-backdrop"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="modal-container bg-gradient-to-b from-[#1a2030] to-[#161b22] rounded-xl p-6 w-11/12 sm:w-96 space-y-6 shadow-xl max-w-lg border border-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header with icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  transactionType === "give" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                }`}
              >
                {transactionType === "give" ? (
                  <Send className="h-5 w-5 transform rotate-180" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-white">
                {transactionType === "give" ? "You Gave" : "You Got"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>


          <div className="space-y-1">
            <div className="amount-input-container">
              <input
                ref={amountInputRef}
                type="text"
                value={amount}
                onChange={handleAmountChange}
                onKeyDown={handleKeyDown}
                placeholder="Amount"
                className={`w-full p-4 bg-[#0d1117] text-white rounded-lg outline-none input-focus-ring amount-input text-lg ${
                  amountError ? "input-error" : ""
                }`}
              />

              {showCalculation && !calculationError && (
                <button
                  ref={expressionRef}
                  onClick={applyCalculation}
                  className="calculation-result"
                  disabled={calculatedAmount === null}
                >
                  {calculationResult} <Check className="h-4 w-4 ml-1" />
                </button>
              )}

              {showCalculation && calculationError && (
                <div className="calculation-error">
                  <AlertCircle className="h-4 w-4 mr-1" /> {calculationError}
                </div>
              )}

              {!showCalculation && !calculationError && <Calculator className="h-5 w-5 calculator-icon" />}
            </div>

            {/* Inline error message */}
            {amountError && (
              <div className="error-message">
                <AlertCircle className="h-4 w-4" />
                <span>{amountError}</span>
              </div>
            )}
          </div>

          {/* Description textarea */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full p-4 bg-[#0d1117] text-white rounded-lg outline-none input-focus-ring resize-none min-h-[80px]"
          ></textarea>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => {
                  setAmount(quickAmount.toString())
                  setShowCalculation(false)
                  setCalculatedAmount(null)
                  setCalculationError("")
                  setAmountError("")

                  // No animation needed, just set the amount immediately
                }}
                className="bg-[#0d1117] hover:bg-[#1a2030] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                ₹{quickAmount}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-2 space-x-4">
            <button
              onClick={handleClose}
              className="w-1/2 bg-[#0d1117] border border-gray-700 px-4 py-3 rounded-lg text-white font-medium hover:bg-gray-800 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-1/2 ${
                transactionType === "give"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
              } px-4 py-3 rounded-lg text-white font-medium transition duration-200 ${
                isLoading ? "opacity-70" : "hover:shadow-lg"
              }`}
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
                  Processing...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionModal