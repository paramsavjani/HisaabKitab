import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im"; // Loading spinner icon

const Search = () => {
  const [query, setQuery] = useState(""); // State for search query (username)
  const [results, setResults] = useState([]); // State for search results (users)
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading status

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message
    setResults([]); // Reset previous search results

    if (!query.trim()) {
      setErrorMessage("Please enter a username to search.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch(
        `https://backend-for-khatabook-f1cr.onrender.com/api/v1/users/search?search=${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "An unknown error occurred.";
        setErrorMessage(errorMessage);
        setLoading(false);
        return;
      }

      if (data.data.length === 0) {
        setErrorMessage("No users found with that username.");
      } else {
        setResults(data.data); // Set search results
      }
    } catch (e) {
      console.error("Network or server error", e);
      setErrorMessage("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Search User
        </h2>
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Enter username to search"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center text-red-500 p-2 rounded-lg bg-red-100/10">
              <FaExclamationTriangle className="mr-2" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <ImSpinner2 className="animate-spin mr-2" /> Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-16 text-white">
            <h3 className="text-xl font-semibold mb-4 text-center">Results</h3>
            <ul className="space-y-3">
              {results.map((user) => (
                <li
                  key={user._id}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg flex items-center space-x-4 shadow-lg transform transition duration-300"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.username}'s profile`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-2xl border-2 border-gray-500">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{user.username}</h4>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
