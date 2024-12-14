import React, { useEffect, useState, useContext } from "react";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
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
          console.log(data.data); // Logging to inspect the structure of the response
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

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center mb-6">
          <FaSpinner className="animate-spin text-white text-4xl" />
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
