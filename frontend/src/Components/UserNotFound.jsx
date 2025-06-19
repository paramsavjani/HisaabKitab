import React from "react";

function UserNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-cyan-50 p-6">
      <div className="text-center max-w-md w-full">
        {/* 404 heading with a more prominent color */}
        <h1 className="text-7xl font-extrabold text-green-500 mb-4 animate__animated animate__fadeIn">
          404
        </h1>

        {/* Subheading with a user-friendly message */}
        <h2 className="text-3xl font-semibold text-white mb-6 animate__animated animate__fadeIn animate__delay-1s">
          Oops! The user you're looking for doesn't exist.
        </h2>

        {/* Description with more clarity */}
        <p className="text-lg mb-8 text-gray-400">
          The user might have been deleted, doesn't exist, or you may have
          mistyped the username.
        </p>

        {/* Button to go back with hover effects */}
        <a
          href="/"
          className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-full hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default UserNotFound;
