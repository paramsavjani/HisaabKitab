import React, { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im"; // Loading spinner icon
import { Link, useSearchParams } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState(""); // State for search query (username)
  const [results, setResults] = useState([]); // State for search results (users)
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading status
  const [search, setSearch] = useSearchParams();

  useEffect(() => {
    const temp = async () => {
      if (!search.has("search") || !search.get("search").trim()) {
        return;
      }
      setQuery(search.get("search"));
      setLoading(true);

      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_BACKEND_URL
          }/api/v1/users/search?search=${search.get("search")}`,
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
          return;
        }

        if (data.data.length === 0) {
          setErrorMessage("No users found with that username.");
        } else {
          setResults(data.data);
        }
      } catch (e) {
        console.error("Network or server error", e);
        setErrorMessage("Failed to connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    temp();
  }, [search]);

  const handleSearch = async (e) => {
    document.activeElement.blur();
    e.preventDefault();

    setErrorMessage(""); // Reset error message
    setResults([]); // Reset previous search results

    if (!query.trim()) {
      setErrorMessage("Please enter a username to search.");
      return;
    }
    setSearch({ search: query });

    setLoading(true); // Start loading

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/search?search=${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("hii i am main");

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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="md:bg-gray-800 bg-black p-8 md:m-10 m-1 rounded-lg shadow-2xl w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-white text-center mb-7">
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
              className="mt-1 block w-full px-4 py-2 md:bg-gray-700 bg-slate-800 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Enter username to search"
              autoComplete="off"
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
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-600 transition-all duration-200 flex items-center justify-center"
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
          <div className="md:mt-16 mt-8 text-white">
            <h3 className="text-xl font-semibold mb-4 text-center">Results</h3>
            <ul className="md:space--2 space-y-1">
              {results.map((user) => (
                <li
                  key={user._id}
                  className="md:bg-gray-700 bg-slate-800 md:hover:bg-gray-600 hover:bg-slate-700 px-4 py-3 rounded-lg flex items-center space-x-4 shadow-lg transition-all duration-300 transform "
                >
                  <Link
                    to={`/users/${user.username}`}
                    className="flex items-center space-x-4 w-full"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
                      <img
                        src={
                          user.profilePicture ||
                          "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                        }
                        alt={`${user.username}'s profile`}
                        className="w-full h-full object-cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                    <div className="truncate">
                      <h4 className="text-green-500 font-bold text-lg">
                        {user.username}
                      </h4>
                      <p className="text-sm text-gray-400">{user.name}</p>
                    </div>
                  </Link>
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
