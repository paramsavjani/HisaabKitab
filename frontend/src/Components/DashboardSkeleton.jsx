import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="p-4 md:bg-gray-950 bg-slate-900 min-h-screen text-white">
      {/* Header Section Skeleton */}
      <div className="pb-2 text-center mb-2 pt-1">
        <div className="h-8 w-60 bg-gray-700 mx-auto rounded-lg animate-pulse"></div>
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden p-4 px-0">
        {/* Combined Summary Section Skeleton */}
        <div
          className="flex items-center justify-center rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: "rgba(30, 30, 30, 0.8)",
          }}
        >
          {/* Total Owe Skeleton */}
          <div className="flex-1 text-center py-3 px-4 border-r border-gray-600 animate-pulse">
            <div className="h-4 w-24 bg-gray-600 mx-auto rounded mb-2"></div>
            <div className="h-6 w-16 bg-gray-700 mx-auto rounded"></div>
          </div>

          {/* Total Receive Skeleton */}
          <div className="flex-1 text-center py-3 px-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-600 mx-auto rounded mb-2"></div>
            <div className="h-6 w-16 bg-gray-700 mx-auto rounded"></div>
          </div>
        </div>
      </div>

      {/* Mobile User List Skeleton */}
      <div className="block md:hidden mt-4">
        <ul className="divide-y divide-gray-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center space-x-4 p-3 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
              </div>
              <div className="h-4 w-16 bg-gray-700 rounded"></div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        {/* Summary Section Skeleton */}
        <div className="my-6 flex flex-col md:flex-row items-stretch justify-around space-y-4 md:space-y-0 md:space-x-6">
          {/* Total Owe Skeleton */}
          <div
            className="p-6 rounded-lg shadow-lg w-full md:w-1/3 text-center animate-pulse"
            style={{ backgroundColor: "rgba(30, 30, 30, 0.6)" }}
          >
            <div className="h-4 w-32 bg-gray-700 mx-auto rounded mb-2"></div>
            <div className="h-8 w-20 bg-gray-600 mx-auto rounded"></div>
          </div>

          {/* Total Receive Skeleton */}
          <div
            className="p-6 rounded-lg shadow-lg w-full md:w-1/3 text-center animate-pulse"
            style={{ backgroundColor: "rgba(30, 30, 30, 0.6)" }}
          >
            <div className="h-4 w-32 bg-gray-700 mx-auto rounded mb-2"></div>
            <div className="h-8 w-20 bg-gray-600 mx-auto rounded"></div>
          </div>
        </div>

        {/* Desktop User List Skeleton */}
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="bg-gray-900 rounded-lg shadow-md p-4 pr-6 flex items-center space-x-4 animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-36 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
              </div>
              <div className="h-6 w-16 bg-gray-700 rounded"></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
