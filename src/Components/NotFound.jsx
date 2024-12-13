import React from "react";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-cyan-50 p-6">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-green-500 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-6">
          Oops! The page you're looking for doesn't exist.
        </h2>
        <p className="text-sm mb-8">
          The page might have been moved, deleted, or you might have mistyped
          the URL.
        </p>

        {/* Button to go back */}
        <a
          href="/"
          className="px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition duration-300"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default NotFound;
