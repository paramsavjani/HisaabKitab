import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function AboutUs() {
  useEffect(() => {
    AOS.init({ duration: 1500, easing: "ease-in-out", once: true });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center pt-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-green-600 animate-text">
            About Me
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Welcome to my world, where technology and creativity meet to
            simplify finance management.
          </p>
        </div>

        {/* Profile Section */}
        <div
          className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16"
          data-aos="fade-right"
        >
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xl font-medium text-gray-300 mb-6 leading-relaxed">
              Hi! I'm Param Savjani, a passionate solo developer on a mission to
              simplify money management for everyone. My goal is to create an
              intuitive platform that makes it easy for users to track their
              personal finances and group expenses.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              With every line of code, I strive to make your financial life
              simpler, more organized, and stress-free.
            </p>
          </div>
          <div
            className="relative w-80 h-80 rounded-full overflow-hidden  border-4 border-green-500"
            data-aos="zoom-in"
          >
            <img
              src="./param.jpg"
              alt="Param Savjani"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 w-full h-full blur-2xl"></div>
          </div>
        </div>

        {/* My Story Section */}
        <div
          className="bg-gray-900 rounded-lg shadow-xl p-8 mb-16 border border-gray-700"
          data-aos="fade-left"
        >
          <h2 className="text-4xl font-bold text-green-400 text-center mb-6">
            My Story
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            It all started with an idea—an idea to make personal and group
            finances easier to manage. Frustrated by the lack of simple
            solutions, I took the challenge into my own hands and built a
            platform that blends simplicity with functionality.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed mt-4">
            Every feature of this app reflects my vision of seamless financial
            management. With your support, I continue to enhance and evolve
            CashTrack for a better tomorrow.
          </p>
        </div>

        {/* Features or Call to Action */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          data-aos="fade-up"
        >
          {/* Feature 1 */}
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-center hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-semibold text-green-400 mb-4">
              Intuitive Design
            </h3>
            <p className="text-gray-300">
              Enjoy a clean, user-friendly interface designed to simplify your
              financial journey.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-center hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-semibold text-green-400 mb-4">
              Seamless Integration
            </h3>
            <p className="text-gray-300">
              Effortlessly manage both personal and group finances in one place.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-center hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-semibold text-green-400 mb-4">
              Constant Innovation
            </h3>
            <p className="text-gray-300">
              I’m always working to improve and add new features to make your
              experience better.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16" data-aos="fade-up">
          <p className="text-lg font-medium text-gray-400 mb-6">
            Have questions or feedback? Feel free to reach out!
          </p>
          <a
            href="/contact"
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-xl transform transition duration-300 hover:scale-110 hover:from-green-600 hover:to-blue-700"
          >
            Contact Me
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
