import React from "react";

function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-900 text-cyan-50 p-6 flex flex-col items-center justify-center pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Title Section */}
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-10 text-center animate-pulse">
          About Me
        </h1>

        {/* Introduction and Image Section */}
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between mb-16 gap-10">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xl font-medium text-gray-300 mb-6 leading-relaxed">
              Hi! I'm Param Savjani, a passionate solo developer on a mission to
              simplify money management for everyone. My goal is to create an
              intuitive platform that makes it easy for users to track their
              personal finances and group expenses.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              This platform is the result of my commitment to bringing
              simplicity and fun to financial tracking. Whether you're managing
              your own finances or sharing expenses with friends, I aim to
              provide a seamless, easy-to-use solution.
            </p>
          </div>
          <div className="justify-center">
            <img
              src="./param.jpg"
              alt="Param Savjani"
              className="w-72 h-72 border-4 border-green-500 mb-6 mx-auto lg:mx-0"
              style={{ borderRadius: "10%" }}
            />
          </div>
        </div>

        {/* My Story Section */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl mb-16">
          <h2 className="text-4xl font-semibold text-green-500 mb-6 text-center">
            My Story
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            My journey began with a realization: managing personal and group
            finances could be so much easier. There were no simple, all-in-one
            solutions that truly combined both aspects of financial tracking.
            So, I took it upon myself to build one.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed mt-4">
            From the idea to its development, every part of this platform has
            been carefully designed and built by me. It’s my way of solving a
            problem that many people face—making money management
            straightforward and enjoyable.
          </p>
        </div>

        {/* Call to Action Section */}
        <div className="mt-10 text-center">
          <p className="text-lg font-semibold text-gray-400 mb-6 leading-relaxed">
            I’m constantly working on new features and improvements. Stay tuned
            for future updates and releases!
          </p>
          <a
            href="/contact"
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold rounded-lg shadow-xl transform transition duration-300 hover:scale-105 hover:from-green-600 hover:to-green-700"
          >
            Contact Me
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
