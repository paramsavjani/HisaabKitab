import React, { useEffect, useState, useContext, act } from "react";
import UserContext from "../context/UserContext.js";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css"; // AOS styles

function Friends() {
  const { user, activeFriends } = useContext(UserContext);

  useEffect(() => {
    AOS.init({ duration: 700 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black py-10 px-4">
      <h2 className="text-3xl font-semibold text-white mb-6" data-aos="fade-up">
        Your Friends
      </h2>


      {
        // Friend List
        <div
          className="w-full max-w-xl bg-gray-900 md:p-6 p-3 rounded-lg shadow-lg"
          data-aos="fade-up"
        >
          {activeFriends.length > 0 ? (
            <ul className="space-y-4">
              {activeFriends.map((friend, index) => (
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
                            ? `${friend.profilePicture}`
                            : "/user2.png"
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
      }
    </div>
  );
}

export default Friends;
