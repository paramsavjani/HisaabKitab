import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaExclamationTriangle } from "react-icons/fa"; // Error icon
import { FaSpinner } from "react-icons/fa"; // Spinner icon
import { Link } from "react-router-dom";

function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [errorMessage, setErrorMessage] = useState(""); // Error state

  // Fetch incoming requests from the backend
  useEffect(() => {
    setLoading(true); // Set loading state to true when starting the fetch request
    axios
      .get(
        "https://backend-for-khatabook-f1cr.onrender.com/api/v1/friendRequests/receivedAll",
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response.data.data.senders);
        setRequests(response.data.data.senders); // Assuming the backend returns an array of requests
        setLoading(false); // Reset loading state after response
      })
      .catch((error) => {
        setLoading(false); // Reset loading state after error
        setErrorMessage("Failed to load incoming requests. Please try again.");
        console.error("Error fetching requests:", error);
      });
  }, []);

  const handleRequest = async (id, action) => {
    // Handle request action (accept or deny)

    setLoading(true);
    await axios.post(
      `https://backend-for-khatabook-f1cr.onrender.com/api/v1/friendRequests/${id}/${action}`,
      {},
      { withCredentials: true }
    );

    // Fetch updated requests after accepting/denying
    axios
      .get(
        "https://backend-for-khatabook-f1cr.onrender.com/api/v1/friendRequests/receivedAll",
        { withCredentials: true }
      )
      .then((response) => {
        setRequests(response.data.data.senders);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage("Failed to load incoming requests. Please try again.");
        console.error("Error fetching requests:", error);
      });

    // Implement the API call to accept/deny request here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-6">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Incoming Friend Requests
        </h2>
        <div className="space-y-4">
          {errorMessage && (
            <div className="flex items-center text-red-500 p-3 mt-2 rounded-lg bg-red-800">
              <FaExclamationTriangle className="mr-3 text-xl" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <FaSpinner className="animate-spin text-green-500 text-2xl" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500">No incoming requests.</p>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-lg hover:bg-gray-600 transition-all duration-300"
              >
                <Link to={`/users/${request.username}`}>
                  <div className="flex items-center space-x-4">
                    {request.profilePicture ? (
                      <img
                        src={request.profilePicture}
                        alt={`${request.username}'s profile`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-2xl border-2 border-gray-500">
                        {request.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-lg font-semibold text-white">
                      {request.name}
                    </span>
                  </div>
                </Link>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleRequest(request.requestId, "accept")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(request.requestId, "deny")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default IncomingRequests;
