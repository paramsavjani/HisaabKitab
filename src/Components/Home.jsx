import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

function Home() {
  useEffect(() => {
    AOS.init({ duration: 1200, easing: "ease-in-out" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-20 font-poppins">
      {/* Hero Section */}
      <section className="text-center max-w-5xl mx-auto mb-20">
        {/* Logo */}
        <div className="flex justify-center items-center mb-10">
          <img src="/logo.png" alt="CashTrack Logo" className="w-40 h-40" />
        </div>

        {/* Hero Text */}
        <h1 className="text-6xl md:text-7xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          CashTrack
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 mb-10 leading-relaxed font-light">
          Track expenses, synchronize transactions, and share costs
          effortlessly.
        </p>

        {/* Hero Buttons */}
        <div className="flex justify-center space-x-6">
          <Link
            to="/signup"
            className="px-10 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-lg font-semibold rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300"
          >
            Get Started
          </Link>
         
        </div>
      </section>

      {/* Why CashTrack Section */}
      <section className="w-full bg-gray-800 py-16 rounded-lg shadow-xl mb-16">
        <h2
          className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400"
          data-aos="fade-up"
        >
          Why CashTrack?
        </h2>
        {/* Grid Layout for Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-8">
          <FeatureCard
            title="Sync Transactions"
            description="Automatically synchronize transactions between your account and your friends' accounts."
          />
          <FeatureCard
            title="Secure Requests"
            description="Send secure money requests. Approvals make it safe and convenient."
          />
          <FeatureCard
            title="Group Splits"
            description="Manage group expenses seamlessly and track shared costs easily."
          />
          <FeatureCard
            title="Detailed Reports"
            description="Get detailed reports of your transactions for better financial management."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-gray-900 py-16">
        <h2
          className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-green-400"
          data-aos="fade-right"
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8">
          <StepCard
            step={1}
            title="Create an Account"
            description="Sign up with a unique username and Gmail. Duplicates are not allowed."
          />
          <StepCard
            step={2}
            title="Find Friends"
            description="Search for friends using their usernames and send requests."
          />
          <StepCard
            step={3}
            title="Sync Transactions"
            description="Once connected, all transactions will auto-sync to both accounts."
          />
          <StepCard
            step={4}
            title="Request Money"
            description="Request funds securely. Approvals make transactions transparent."
          />
        </div>
      </section>
    </div>
  );
}

// Reusable Feature Card Component
const FeatureCard = ({ title, description }) => (
  <div
    className="p-8 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl shadow-md hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
    data-aos="fade-up"
  >
    <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

// Reusable Step Card Component
const StepCard = ({ step, title, description }) => (
  <div
    className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
    data-aos="zoom-in"
  >
    <h3 className="text-2xl font-semibold text-white mb-4">
      Step {step}: {title}
    </h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default Home;
