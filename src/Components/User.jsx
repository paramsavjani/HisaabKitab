import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log(data.data.user)
        setUser(data.data.user);
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
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        {user && (
          <>
            <div className="flex items-center space-x-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{user.name || "No Name"}</h1>
                <p className="text-green-400">@{user.username}</p>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300">
                User Details
              </h3>
              <ul className="mt-2 space-y-2 text-gray-400">
                <li>
                  <span className="font-medium text-white">Name:</span>{" "}
                  {user.name}
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
        )}
      </div>
    </div>
  );
};

export default User;
