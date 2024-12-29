import React, { useEffect, useState, useContext, act } from "react";
import { Link, useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../context/UserContext.js";
import UserNotFound from "./UserNotFound";
import socket from "../socket.js";
import { Preferences } from "@capacitor/preferences";

const User = () => {
  const {
    user,
    accessToken,
    refreshToken,
    incomingRequests,
    setIncomingRequests,
    setSentRequests,
    sentRequests,
    setActiveFriends,
    activeFriends,
  } = useContext(UserContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [isRequestReceived, setIsRequestReceived] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isCancelingRequest, setIsCancelingRequest] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/users/get/${id}`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ accessToken, refreshToken }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setProfile(data?.user);
          if (data?.requested) {
            if (data?.request?.sender === user._id) {
              setIsRequestSent(true);
              setRequestId(data?.request?._id);
            } else {
              setIsRequestReceived(true);
              setRequestId(data?.request?._id);
            }
          }
          if (data?.friendship) {
            setIsFriend(true);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);

    fetchUser();
  }, [id]);

  useEffect(() => {
    const isIncomingRequest = incomingRequests.find(
      (request) => request.username === profile?.username
    );
    if (isIncomingRequest) {
      setIsRequestReceived(true);
      setRequestId(isIncomingRequest.requestId);
    } else {
      setIsRequestReceived(false);
    }

    const isSentRequest = sentRequests.find(
      (request) => request.receiver === profile?.username
    );
    if (isSentRequest) {
      setIsRequestSent(true);
      setRequestId(isSentRequest.requestId);
    }

    const isFriend = activeFriends.find(
      (f) => f.username === profile?.username
    );

    if (isFriend) {
      setIsFriend(true);
    } else {
      setIsFriend(false);
    }
  }, [
    activeFriends,
    incomingRequests,
    profile?.username,
    sentRequests,
    setIncomingRequests,
  ]);

  const addFriend = async () => {
    setIsAddingFriend(true);
    try {
      const { value: accessToken } = await Preferences.get({
        key: "accessToken",
      });
      const { value: refreshToken } = await Preferences.get({
        key: "refreshToken",
      });
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${profile.username}/send`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ accessToken, refreshToken }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRequestId(data.data.requestId);
        setIsRequestSent(true);
        setSentRequests((prev) => [
          ...prev,
          { requestId: data.data.requestId, receiver: profile.username },
        ]);

        socket.emit("sendFriendRequest", {
          request: { requestId: data.data.requestId, ...user },
          receiver: profile.username,
          fcmToken: profile?.fcmToken,
        });
      } else {
        const data = await response.json();
        toast.error(data.message || "Error adding friend!");
      }
    } catch (error) {
      toast.error("Error adding friend!");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const cancelFriendRequest = async () => {
    if (isRequestSent && requestId) {
      setIsCancelingRequest(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${requestId}/cancel`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ accessToken, refreshToken }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          setIsRequestSent(false);
          setIsFriend(false);
          setSentRequests((prev) =>
            prev.filter((request) => request.receiver !== profile.username)
          );

          socket.emit("cancelFriendRequest", {
            requestId,
            receiver: profile.username,
            senderName: user.name,
            senderUsername: user.username,
          });
        } else {
          const data = await response.json();
          toast.error(data.message || "Error canceling request!");
        }
      } catch (error) {
        toast.error("Error canceling friend request!");
      } finally {
        setIsCancelingRequest(false);
      }
    }
  };

  const handleRequest = async (id, action, senderUsername) => {
    setIsAccepting(action === "accept");
    setIsRejecting(action === "deny");

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/v1/friendRequests/${id}/${action}`,
      {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ accessToken, refreshToken }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const data = await res.json();
      toast.error(
        data.message || "Failed to handle request. Please try again."
      );
      setIsAccepting(false);
      setIsRejecting(false);
      return;
    }
    const { email, ...extra } = user;

    const sender = incomingRequests.find((request) => request.requestId === id);

    socket.emit("actionOnFriendRequest", {
      id,
      action,
      extra,
      senderUsername,
      fcmToken: sender.fcmToken,
    });

    if (action === "accept") {
      const { requestId, _id, ...rest } = sender;
      setIsFriend(true);
      setActiveFriends((prev) => [
        ...prev,
        { totalAmount: 0, isActive: false, ...rest },
      ]);
    }
    setIncomingRequests((p) => p.filter((request) => request.requestId !== id));
    setRequestId(null);
    setIsRequestReceived(false);
    setIsAccepting(false);
    setIsRejecting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-6">
        <div className="flex items-center space-x-4">
          <FaSpinner className="animate-spin text-6xl text-green-500" />
          <p className="text-2xl font-semibold tracking-wide animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const renderButton = (text, onClick, isLoading, baseClass, loadingText) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full px-4 py-3 text-lg font-semibold rounded-lg transition duration-300 focus:outline-none focus:ring-2 ${baseClass} ${
        isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
      }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center space-x-2">
          <FaSpinner className="animate-spin" />
          <span>{loadingText}</span>
        </span>
      ) : (
        text
      )}
    </button>
  );

  if (!profile?.username) {
    return <UserNotFound />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-xs p-6 rounded-xl shadow-lg bg-gray-900">
        {/* Header Section */}
        <div className="flex items-center mb-6">
          {/* User Image */}
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mr-6">
            <img
              src={
                profile.profilePicture ||
                "https://tse1.mm.bing.net/th/id/OIP.aYhGylaZyL4Dj0CIenZPlAHaHa?rs=1&pid=ImgDetMain"
              } // fallback image if no profile picture is available
              alt={profile.profilePicture}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Details */}
          <div>
            <p className="text-xl font-bold">{profile.name || "No Name"}</p>
            <h1 className="text-sm  text-green-500">@{profile.username}</h1>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-4"></div>

        {/* Info Section */}
        <div className="space-y-4">
          {/* Friends Count */}
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
            <p className="text-sm font-medium">Total Friends</p>
            <p className="text-lg font-semibold text-gray-200">
              {profile.totalFriends || 0}
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6">
          {user && user.username !== profile.username && (
            <div className="mt-6 space-y-4">
              {!isFriend &&
                !isRequestSent &&
                !isRequestReceived &&
                renderButton(
                  "Add Friend",
                  addFriend,
                  isAddingFriend,
                  "bg-green-600 text-white focus:ring-green-500",
                  "Adding..."
                )}

              {!isFriend &&
                isRequestSent &&
                renderButton(
                  "Cancel Request",
                  cancelFriendRequest,
                  isCancelingRequest,
                  "bg-red-600 text-white focus:ring-red-500",
                  "Canceling..."
                )}

              {isRequestReceived && (
                <div className="flex space-x-4">
                  {renderButton(
                    "Accept",
                    () => handleRequest(requestId, "accept", profile.username),
                    isAccepting,
                    "bg-green-500 text-white",
                    "Accepting..."
                  )}
                  {renderButton(
                    "Reject",
                    () => handleRequest(requestId, "deny", profile.username),
                    isRejecting,
                    "bg-red-500 text-white",
                    "Rejecting..."
                  )}
                </div>
              )}

              {isFriend && (
                <Link
                  to={`/transactions/${user.username}--${profile.username}`}
                  className="w-full px-4 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg text-center block"
                >
                  Transactions
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
