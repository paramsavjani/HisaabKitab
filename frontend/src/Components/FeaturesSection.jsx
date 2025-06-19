import React from "react";
import Feature from "./Feature";
import {
  FaChartPie,
  FaUsers,
  FaHandHoldingUsd,
  FaShieldAlt,
  FaSyncAlt,
} from "react-icons/fa";

function FeaturesSection() {
  return (
    <section className="w-full bg-gray-900 py-20 text-gray-50">
      {/* Title */}
      <div className="text-center mb-16 px-6">
        <h2 className="text-5xl font-extrabold text-gray-100 mb-4">
          Discover the Power of CashTrack
        </h2>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          CashTrack isn't just about tracking expenses. It's about creating a
          smarter, stress-free way to manage your money and settle up with your
          group.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-6 md:px-20">
        {/* Feature 1 */}
        <Feature
          title="Track Your Expenses"
          description="Effortlessly record and organize your expenses with detailed insights to help you make better financial decisions."
          icon={<FaChartPie />}
        />

        {/* Feature 2 */}
        <Feature
          title="Settle Up with Friends"
          description="Split costs seamlessly with automatic calculations. Say goodbye to awkward conversations about who owes what."
          icon={<FaUsers />}
        />

        {/* Feature 3 */}
        <Feature
          title="Smart Group Management"
          description="Manage group expenses for trips, events, or households with ease, keeping everyone on the same page."
          icon={<FaHandHoldingUsd />}
        />

        {/* Feature 4 */}
        <Feature
          title="Secure and Private"
          description="Your data is protected with advanced encryption, ensuring your financial information remains confidential."
          icon={<FaShieldAlt />}
        />

        {/* Feature 5 */}
        <Feature
          title="Automatic Updates"
          description="Sync your accounts for real-time expense tracking, ensuring you always stay on top of your finances."
          icon={<FaSyncAlt />}
        />
      </div>
    </section>
  );
}

export default FeaturesSection;
