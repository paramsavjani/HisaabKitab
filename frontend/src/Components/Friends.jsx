import React, { useEffect, useState, useContext } from "react";
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
    <div
      className="min-h-screen flex flex-col items-center justify-center py-10 px-4 text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(34,197,94,0.06), rgba(0,0,0,0) 60%), radial-gradient(1000px 500px at 110% 10%, rgba(59,130,246,0.06), rgba(0,0,0,0) 55%), linear-gradient(180deg, #0a0a0b 0%, #050505 100%)",
      }}
    >
      <h2 className="text-3xl font-semibold mb-6" data-aos="fade-up">
        Your Friends
      </h2>


      {
        // Friend List
        <div
          className="w-full max-w-xl md:p-6 p-3 bg-gray-950 rounded-2xl border border-white/5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          data-aos="fade-up"
          // style={{ backgroundColor: "rgba(10,10,11,0.6)" }}
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
                    className="flex items-center space-x-4 p-3 py-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-colors duration-200"
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
                        className="w-full h-full rounded-full object-cover border border-white/10 shadow-[0_0_12px_rgba(0,0,0,0.4)]"
                        data-aos="flip-left"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-emerald-400/90">
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
