import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
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
        } else {
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
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
        console.error("Error fetching friend request status:", error);
      }
    };

    fetchRequestStatus();
  }, [profile, id]);

  // Send friend request
  const addFriend = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${profile.username}/send`,
        { method: "POST", credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setRequestId(data.data.requestId);
        setIsRequestSent(true);
        
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  // Cancel friend request
  const cancelFriendRequest = async () => {
    if (isRequestSent && requestId) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${requestId}/cancel`,
          { method: "DELETE", credentials: "include" }
        );
        if (response.ok) {
          setIsRequestSent(false);
          setIsFriend(false);
        }
      } catch (error) {
        console.error("Error canceling friend request:", error);
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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-xl space-y-6">
        <div className="flex items-center space-x-6">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-4xl font-bold">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-semibold">
              {profile.name || "No Name"}
            </h1>
            <p className="text-green-400">@{profile.username}</p>
            <p className="text-gray-400 mt-1">{profile.email}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-300">User Details</h3>
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
                className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Add Friend
              </button>
            )}

            {!isFriend && isRequestSent && (
              <button
                onClick={cancelFriendRequest}
                className="w-full px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Cancel Request
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
  );
};

export default User;
