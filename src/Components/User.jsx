import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa"; // Importing a spinner icon
import UserNotFound from "./UserNotFound";
import UserContext from "../context/UserContext";
import { useContext } from "react";

const User = () => {
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [friendStatus, setFriendStatus] = useState("not_friends");
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/get/${id}`
        );

        if (user) {
          const Friend = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/v1/friends/${id}`,
            {
              method: "GET",
              credentials: "include",
              withCredentials: true,
            }
          );
          const data = await Friend.json();
          console.log(data);
          if (Friend.data.data) {
            setIsFriend(true);
          }
        }

        if (response.status === 410) {
          setError("User does not exist.");
        } else if (!response.ok) {
          throw new Error("Failed to fetch user data");
        } else {
          const data = await response.json();
          setProfile(data.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Unable to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, user]);

  const addFriend = async () => {
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}//api/v1/friendRequests/${profile.username}/send`,
        { method: "POST" }
      );

      setFriendStatus("request_sent");
    } catch (error) {
      console.error("Error adding friend:", error);
      setFriendStatus("not_friends");
    }
  };

  const cancelFriendRequest = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friends/cancel/${id}`,
        { method: "POST" }
      );

      if (response.ok) {
        setFriendStatus("not_friends");
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <FaSpinner className="animate-spin text-4xl" />
        <p className="ml-4">Loading...</p>
      </div>
    );
  }

  // if (error) {
  //   return <UserNotFound />;
  // }

  return (
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
                {friendStatus === "not_friends" && (
                  <button
                    onClick={addFriend}
                    className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Add Friend
                  </button>
                )}

                {friendStatus === "request_sent" && (
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

                {friendStatus === "friend_added" && (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg"
                  >
                    Friend Added
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
  );
};

export default User;
