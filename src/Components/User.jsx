import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa"; // Importing a spinner icon
import UserNotFound from "./UserNotFound";

const User = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `https://backend-for-khatabook-f1cr.onrender.com/api/v1/users/get/${id}`
        );

        if (response.status === 410) {
          setError("User does not exist.");
        } else if (!response.ok) {
          throw new Error("Failed to fetch user data");
        } else {
          const data = await response.json();
          setUser(data.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Unable to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <FaSpinner className="animate-spin text-4xl" />
        <p className="ml-4">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <UserNotFound message={error} />
    );
  }

  

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-xl">
        {user ? (
          <>
            <div className="flex items-center space-x-6">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-4xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-semibold">
                  {user.name || "No Name"}
                </h1>
                <p className="text-green-400">@{user.username}</p>
                <p className="text-gray-400 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-300">
                User Details
              </h3>
              <ul className="mt-4 space-y-3 text-gray-400">
                <li>
                  <span className="font-medium text-white">Name:</span>{" "}
                  {user.name || "Not Provided"}
                </li>
                <li>
                  <span className="font-medium text-white">Username:</span>{" "}
                  {user.username}
                </li>
                <li>
                  <span className="font-medium text-white">Email:</span>{" "}
                  {user.email}
                </li>
              </ul>
            </div>
          </>
        ) : (
          <p className="text-xl text-red-500">User not found.</p>
        )}
      </div>
    </div>
  );
};

export default User;
