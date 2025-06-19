import React from "react";

function Feature({ title, description, icon }) {
  return (
    <div className="w-full max-w-xs p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition-transform duration-300 flex flex-col items-center text-center">
      {/* Icon Section */}
      <div className="text-green-500 text-6xl mb-6">{icon}</div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-100 mb-4">{title}</h3>

      {/* Description */}
      <p className="text-gray-400 leading-relaxed mb-6">{description}</p>

      {/* Learn More Button */}
      <button className="px-6 py-2 bg-green-600 text-white font-medium rounded-full shadow-md hover:bg-green-700 transition duration-300">
        Learn More
      </button>
    </div>
  );
}

export default Feature;
