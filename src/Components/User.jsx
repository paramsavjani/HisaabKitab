import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify"; // Importing toast
import "react-toastify/dist/ReactToastify.css"; // Importing styles

import UserContext from "../context/UserContext";
import UserNotFound from "./UserNotFound";

const User = () => {
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // Additional loading states for buttons
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isCancelingRequest, setIsCancelingRequest] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/get/${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setProfile(data.user);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Fetch friend status
  useEffect(() => {
    if (!profile) return;
    const fetchFriendStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/friends/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          setIsFriend(true);
          setIsRequestSent(false);
        }
      } catch (error) {
        console.log("Not friends yet");
      }
    };
    fetchFriendStatus();
  }, [profile, id]);

  // Fetch if a request was already sent
  useEffect(() => {
    if (!profile) return;
    const fetchRequestStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${id}/alreadyRequested`,
          { method: "GET", credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setRequestId(data.data.requestId);
          setIsRequestSent(true);
        }
      } catch (error) {
        toast.error("Error fetching request status!");
      }
    };

    fetchRequestStatus();
  }, [profile, id]);

  // Send friend request
  const addFriend = async () => {
    setIsAddingFriend(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${profile.username}/send`,
        { method: "POST", credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setRequestId(data.data.requestId);
        setIsRequestSent(true);
      } else {
        const data = await response.json();
        toast.error(data.message || "Error adding friend!");
      }
    } catch (error) {
      toast.error("Error adding friend!");
    } finally {
      setIsAddingFriend(false);
    }
  };

  // Cancel friend request
  const cancelFriendRequest = async () => {
    if (isRequestSent && requestId) {
      setIsCancelingRequest(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${requestId}/cancel`,
          { method: "DELETE", credentials: "include" }
        );
        if (response.ok) {
          setIsRequestSent(false);
          setIsFriend(false);
        } else {
          const data = await response.json();
          toast.error(data.message || "Error canceling request!");
        }
      } catch (error) {
        toast.error("Error canceling friend request!");
      } finally {
        setIsCancelingRequest(false);
      }
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-6">
        <div className="flex items-center space-x-4">
          <FaSpinner className="animate-spin text-6xl text-green-500" />
          <p className="text-2xl font-semibold tracking-wide animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // User not found UI
  if (!profile?.username) {
    return <UserNotFound />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-8">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-xl space-y-6">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-500 flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}

            {/* User Details */}
            <div className="flex-1 overflow-hidden">
              <h1 className="text-3xl font-semibold truncate">
                {profile.name || "No Name"}
              </h1>
              <p className="text-green-400 truncate">@{profile.username}</p>
              <p className="text-gray-400 truncate">{profile.email}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-300">
              User Details
            </h3>
            <ul className="mt-4 space-y-3 text-gray-400">
              <li>
                <span className="font-medium text-white">Name:</span>{" "}
                {profile.name || "Not Provided"}
              </li>
              <li>
                <span className="font-medium text-white">Username:</span>{" "}
                {profile.username}
              </li>
              <li>
                <span className="font-medium text-white">Email:</span>{" "}
                {profile.email}
              </li>
            </ul>
          </div>

          {user && user.username !== profile.username && (
            <div className="mt-6 space-y-4">
              {!isFriend && !isRequestSent && (
                <button
                  onClick={addFriend}
                  disabled={isAddingFriend}
                  className={`w-full px-6 py-3 text-lg font-semibold rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
                    isAddingFriend
                      ? "bg-green-700 text-white"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isAddingFriend ? (
                    <span className="flex items-center justify-center space-x-2">
                      <FaSpinner className="animate-spin text-white" />
                      <span>Adding...</span>
                    </span>
                  ) : (
                    "Add Friend"
                  )}
                </button>
              )}

              {!isFriend && isRequestSent && (
                <button
                  onClick={cancelFriendRequest}
                  disabled={isCancelingRequest}
                  className={`w-full px-6 py-3 text-lg font-semibold rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                    isCancelingRequest
                      ? "bg-red-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isCancelingRequest ? (
                    <span className="flex items-center justify-center space-x-2">
                      <FaSpinner className="animate-spin text-white" />
                      <span>Canceling...</span>
                    </span>
                  ) : (
                    "Cancel Request"
                  )}
                </button>
              )}

              {isFriend && (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg"
                >
                  Message
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={5}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default User;
