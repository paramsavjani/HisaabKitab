import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 py-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl font-extrabold text-gray-100 mb-6">
          Welcome to CashTrack
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Track your personal and group expenses effortlessly. Keep an eye on
          your finances, share costs with friends, and stay organized.
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            to="/signup"
            className="px-8 py-3 bg-green-600 text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-gray-600 text-lg font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="text-center w-full bg-gray-800 py-16">
        <h2 className="text-4xl font-semibold text-gray-100 mb-12">
          Why CashTrack?
        </h2>
        <div className="flex flex-wrap justify-center gap-16">
          {/* Feature 1 */}
          <div className="w-72 p-8 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Track Your Expenses
            </h3>
            <p className="text-gray-300">
              Easily record and categorize your expenses. Gain insights into
              your spending habits and make informed decisions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="w-72 p-8 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Settle Up with Friends
            </h3>
            <p className="text-gray-300">
              Quickly calculate who owes what, and settle debts with friends. No
              more confusion or hassle when splitting costs.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="w-72 p-8 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Smart Group Management
            </h3>
            <p className="text-gray-300">
              Manage your group expenses with ease. Whether it’s a trip or
              shared household expenses, CashTrack makes it simple.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="text-center w-full bg-gray-900 text-white py-16">
        <h2 className="text-4xl font-semibold text-gray-100 mb-12">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
          {/* Step 1 */}
          <div className="w-72 p-8 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Create an Account
            </h3>
            <p className="text-gray-300">
              Sign up easily with just a few details. It takes seconds to get
              started.
            </p>
          </div>

          {/* Step 2 */}
          <div className="w-72 p-8 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Add Expenses
            </h3>
            <p className="text-gray-300">
              Record your expenses manually or automatically track them from
              your bank account.
            </p>
          </div>

          {/* Step 3 */}
          <div className="w-72 p-8 bg-gray-700 rounded-lg shadow-lg hover:bg-gray-600 transition duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Settle Up
            </h3>
            <p className="text-gray-300">
              Easily calculate and track who owes what. Settle your expenses
              quickly and conveniently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
