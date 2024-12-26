import React, { useState } from "react";
import { FaExclamationTriangle, FaSpinner } from "react-icons/fa"; // Error and Spinner icons
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext.js";
import socket from "../socket.js";
import useDashboardContext from "../context/DashboardContext.js";

function IncomingRequests() {
  const [errorMessage, setErrorMessage] = useState(""); // Error state
  const [buttonLoading, setButtonLoading] = useState({}); // Individual button loading state
  const {
    user,
    accessToken,
    refreshToken,
    incomingRequests,
    setIncomingRequests,
  } = React.useContext(UserContext);
  const { setActiveFriends } = useDashboardContext();

  const handleRequest = async (id, action, senderUsername) => {
    setButtonLoading((prev) => ({ ...prev, [`${id}-${action}`]: true }));
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${id}/${action}`,
        {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({ accessToken, refreshToken }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(
          data.message || "Failed to handle request. Please try again."
        );
        setButtonLoading((prev) => ({ ...prev, [`${id}-${action}`]: false }));
        return;
      }

      const { _id: userId, email, ...extra } = user;
      socket.emit("actionOnFriendRequest", {
        id,
        action,
        extra,
        senderUsername,
      });

      const sender = incomingRequests.find(
        (request) => request.requestId === id
      );
      const { requestId, _id, ...rest } = sender;

      if (action === "accept") {
        setActiveFriends((prev) => [
          ...prev,
          { totalAmount: 0, isActive: false, ...rest },
        ]);
      }

      setIncomingRequests((p) =>
        p.filter((request) => request.requestId !== id)
      );
      setButtonLoading((prev) => ({ ...prev, [`${id}-${action}`]: false }));
    } catch (err) {
      setErrorMessage("Failed to handle request. Please try again.");
      setButtonLoading((prev) => ({ ...prev, [`${id}-${action}`]: false }));
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Incoming Friend Requests
        </h2>
        <div className="space-y-4">
          {errorMessage && (
            <div className="flex items-center text-white p-3 rounded-lg bg-red-600">
              <FaExclamationTriangle className="mr-3 text-xl" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          {incomingRequests.length === 0 ? (
            <p className="text-center text-gray-500">No incoming requests.</p>
          ) : (
            incomingRequests.map((request) => (
              <div
                key={request._id}
                className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-600 transition-all duration-300"
              >
                <Link
                  to={`/users/${request.username}`}
                  className="flex items-center space-x-4 mb-4 sm:mb-0"
                >
                  <img
                    src={
                      request.profilePicture ||
                      "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                    }
                    alt={`${request.username}'s profile`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                  />
                  <span className="text-lg font-semibold text-white">
                    {request.name}
                  </span>
                </Link>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleRequest(
                        request.requestId,
                        "accept",
                        request.username
                      )
                    }
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm flex items-center"
                    disabled={buttonLoading[`${request.requestId}-accept`]}
                  >
                    {buttonLoading[`${request.requestId}-accept`] ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      "Accept"
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleRequest(request.requestId, "deny", request.username)
                    }
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm flex items-center"
                    disabled={buttonLoading[`${request.requestId}-deny`]}
                  >
                    {buttonLoading[`${request.requestId}-deny`] ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      "Deny"
                    )}
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
