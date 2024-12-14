import React, { useEffect, useState, useContext } from "react";
import UserContext from "../context/UserContext";

function Friends() {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (user) {
      // Fetch friends list
      setLoading(true); // Set loading to true when the request starts
      fetch("https://backend-for-khatabook-f1cr.onrender.com/api/v1/friends", {
        method: "GET",
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch friends");
          }
          return response.json(); // Parse response body as JSON
        })
        .then((data) => {
          setFriends(data.data); // Assuming the response contains the 'friends' array
        })
        .catch((e) => {
          console.error("Failed to fetch friends", e);
          setError(e.message); // Handle error
        })
        .finally(() => {
          setLoading(false); // Set loading to false once the fetch is complete
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 py-10">
      <h2 className="text-3xl font-semibold text-white mb-6">Your Friends</h2>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-6 max-w-xl w-full">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Skeleton Loader */}
      {loading ? (
        <div className="w-full max-w-xl bg-gray-900 p-6 rounded-lg shadow-lg">
          {/* Skeleton for the friend list */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Friend List
        <div className="w-full max-w-xl bg-gray-900 p-6 rounded-lg shadow-lg">
          {friends.length > 0 ? (
            <ul className="space-y-4">
              {friends.map((friend) => (
                <li
                  key={friend._id}
                  className="flex items-center space-x-4 border-b border-gray-700 py-2"
                >
                  <div className="w-12 h-12">
                    {/* Profile Picture */}
                    <img
                      src={
                        friend.profilePicture ||
                        "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                      }
                      alt={friend.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {friend.username}
                    </p>
                    <p className="text-sm text-gray-400">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">
              You have no friends yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Friends;
