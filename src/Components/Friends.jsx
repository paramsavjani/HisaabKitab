import React, { useEffect, useState, useContext, act } from "react";
import UserContext from "../context/UserContext.js";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css"; // AOS styles
import useDashboardContext from "../context/DashboardContext.js";

function Friends() {
  const { user, accessToken, refreshToken } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const { setActiveFriends, activeFriends } = useDashboardContext();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch friends list
      setLoading(true); // Set loading to true when the request starts
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/friends`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: accessToken,
          refreshToken: refreshToken,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch friends");
          }
          return response.json(); // Parse response body as JSON
        })
        .then((data) => {
          if (data.data && data.data.length > 0) {
            setFriends(data.data);
          }
        })
        .catch((e) => {
          console.error("Failed to fetch friends", e);
          setError(e.message); // Handle error
        })
        .finally(() => {
          setLoading(false); // Set loading to false once the fetch is complete
        });
    } else {
      setLoading(false);
    }
  }, [user, accessToken, refreshToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-10 px-4">
      <h2 className="text-3xl font-semibold text-white mb-6" data-aos="fade-up">
        Your Friends
      </h2>

      {/* Error Handling */}
      {error && (
        <div
          className="bg-red-500 text-white p-4 rounded-md mb-6 max-w-xl w-full"
          data-aos="fade-up"
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Skeleton Loader */}
      {loading ? (
        <div
          className="w-full max-w-xl bg-gray-900 p-6 rounded-lg shadow-lg"
          data-aos="fade-up"
        >
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 animate-pulse"
                data-aos="fade-right"
                data-aos-delay={index * 100} // Staggered animations
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
        <div
          className="w-full max-w-xl bg-gray-900 md:p-6 p-3 rounded-lg shadow-lg"
          data-aos="fade-up"
        >
          {friends.length > 0 ? (
            <ul className="space-y-4">
              {friends.map((friend, index) => (
                <Link
                  to={`/transactions/${user.username}--${friend.username}`}
                  className=""
                  key={index}
                >
                  <li
                    className="flex items-center space-x-4 border-b hover:bg-slate-800 hover:rounded-lg p-3 border-gray-700 py-4"
                    data-aos="zoom-in"
                    data-aos-delay={index * 100} // Staggered animations for each friend
                  >
                    <div className="w-12 h-12">
                      {/* Profile Picture */}
                      <img
                        src={
                          friend.profilePicture
                            ? friend.profilePicture
                            : "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
                        }
                        alt={friend.username}
                        className="w-full h-full rounded-full object-cover"
                        data-aos="flip-left"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{friend.name}</p>
                      <p className="text-sm text-green-400">
                        {"@" + friend.username}
                      </p>
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <p
              className="text-gray-400 text-center"
              data-aos="fade-up"
              data-aos-duration="1200"
            >
              You have no friends yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Friends;
