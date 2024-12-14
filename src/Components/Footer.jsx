import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-white py-6">
      <div className="container mx-auto px-6">
        {/* Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="text-2xl font-bold text-green-500">
            <Link
              to="/"
              className="hover:text-green-300 transition duration-200"
            >
              Cash<span className="text-white">Track</span>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="flex space-x-6">
            <Link
              to="/terms"
              className="text-gray-400 hover:text-green-500 transition duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-green-500 transition duration-200"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4 text-gray-400">
            <Link
              to="#"
              className="hover:text-green-500 transition duration-200"
              aria-label="Facebook"
            >
              <FaFacebook className="h-6 w-6" />
            </Link>
            <Link
              to="#"
              className="hover:text-green-500 transition duration-200"
              aria-label="Twitter"
            >
              <FaTwitter className="h-6 w-6" />
            </Link>
            <Link
              to="#"
              className="hover:text-green-500 transition duration-200"
              aria-label="Instagram"
            >
              <FaInstagram className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 mt-6">
          <p>
            &copy; {new Date().getFullYear()} CashTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
