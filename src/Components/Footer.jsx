import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-8">
      <div className="container mx-auto px-6">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-500">
              <Link
                to="/"
                className="hover:text-green-300 transition duration-200"
              >
                Cash<span className="text-white">Track</span>
              </Link>
            </h2>
            <p className="text-gray-400">
              Simplify your finances with CashTrack. Track expenses, split
              bills, and manage transactions effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="hover:text-green-500 transition duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="hover:text-green-500 transition duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-green-500 transition duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
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
              <Link
                to="#"
                className="hover:text-green-500 transition duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} CashTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
