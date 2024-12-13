import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar({ user, login, logout }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Cash<span>Track</span>
      </div>
      {user ? (
        <div className="navbar-user">
          <img
            src={user.profilePicture}
            alt="profile"
            className="navbar-profile-pic"
          />
          <span>{user.username}</span>
          <button className="navbar-button logout" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <button className="navbar-button text-cyan-800" onClick={login}>
          Login
        </button>
      )}
    </nav>
  );
}

export default Navbar;
