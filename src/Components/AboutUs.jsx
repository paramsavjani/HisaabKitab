import React from "react";

function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-900 text-cyan-50 p-6 flex flex-col items-center justify-center pt-20">
      <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-6 animate-pulse">
              About Us
            </h1>

            {/* Description Section */}
        <p className="text-xl font-medium text-gray-300 mb-8">
          We are a passionate team dedicated to making money management easier
          and more fun for everyone. Our mission is to simplify tracking
          personal finances, group expenses, and everything in between, all in
          one intuitive platform.
        </p>

        {/* Our Story Section */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl mb-8">
          <h2 className="text-3xl font-semibold text-green-500 mb-4">
            Our Story
          </h2>
          <p className="text-lg text-gray-400">
            It all started with the need to simplify how people manage group
            expenses. We realized that there was no easy-to-use solution that
            combined both individual and group financial tracking in one place.
            So, we set out to create a platform that makes it simple to track
            every penny, share expenses with friends, and keep everyone on the
            same page.
          </p>
        </div>

        {/* Our Team Section */}
        <div className="flex flex-wrap justify-center gap-8">
          <div className="flex flex-col items-center max-w-xs p-6 bg-gray-800 rounded-lg shadow-lg">
            <img
              src="./param.jpg"
              alt="Team Member 1"
              className="w-32 h-32 rounded-full mb-4"
            />
            <h3 className="text-xl font-semibold text-white">Param Savjani</h3>
            <p className="text-gray-400">Backend Developer</p>
          </div>
          <div className="flex flex-col items-center max-w-xs p-6 bg-gray-800 rounded-lg shadow-lg">
            <img
              src="https://via.placeholder.com/150"
              alt="Team Member 3"
              className="w-32 h-32 rounded-full mb-4"
            />
            <h3 className="text-xl font-semibold text-white">Nidhi Dodiya</h3>
            <p className="text-gray-400">Designer</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10">
          <p className="text-lg font-semibold text-gray-400 mb-4">
            We’re always working to make things better. Stay tuned for upcoming
            features and updates!
          </p>
          <a
            href="/contact"
            className="px-8 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-xl hover:bg-green-600 transition duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
