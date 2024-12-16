import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa"; // Importing a spinner icon
import UserContext from "../context/UserContext";
import { useContext } from "react";
import UserNotFound from "./UserNotFound";
import { useCallback } from "react";

const User = () => {
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const fetchFriendStatus = useCallback(async () => {
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
      console.error("Error fetching friend status:", error);
    }
  }, [id]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/get/${id}`
      );

      const data = await response.json();
      if (response.ok) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRequestStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${id}/alreadyRequested`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRequestId(data.data.requestId);
        setIsRequestSent(true);
      }
    } catch (error) {
      console.error("Error fetching friend request status:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestStatus();
  }, [fetchRequestStatus]);

  useEffect(() => {
    fetchFriendStatus();
  }, [fetchFriendStatus]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const addFriend = async () => {
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${profile.username}/send`,
        { method: "POST", credentials: "include" }
      );
      setIsRequestSent(true);
      fetchRequestStatus();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const cancelFriendRequest = async () => {
    try {
      if (isRequestSent && requestId) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${requestId}/cancel`,
          { method: "DELETE", credentials: "include" }
        );
        if (response.ok) {
          setRequestId(null);
          setIsRequestSent(false);
          setIsFriend(false);
        }
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

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

  return profile?.username ? (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-xl space-y-6">
        {profile ? (
          <>
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

            {user && (
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
                  <>
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-gray-600 text-white text-lg font-semibold rounded-lg"
                    >
                      Friend Request Sent
                    </button>
                    <button
                      onClick={cancelFriendRequest}
                      className="w-full px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Cancel Request
                    </button>
                  </>
                )}

                {isFriend && (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg"
                  >
                    message
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-xl text-red-500">User not found.</p>
        )}
      </div>
    </div>
  ) : (
    <UserNotFound />
  );
};

export default User;
