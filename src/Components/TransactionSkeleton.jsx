import React from "react";

function TransactionSkeleton() {
  const SkeletonProfile = () => (
    <div className="bg-gray-800 shadow-lg p-4 pl-16 md:pl-6 mb-6 flex items-center space-x-4 mx-auto w-full justify-start fixed top-0 z-10">
      {/* Circular skeleton for profile picture */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-full animate-pulse"></div>
      {/* Rectangular skeletons for name and total */}
      <div className="flex-1 space-y-2">
        <div className="h-6 w-24 bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-600 rounded animate-pulse"></div>
      </div>
      <div className="h-8 w-20 bg-gray-600 rounded animate-pulse"></div>
    </div>
  );

  const SkeletonButtons = () => (
    <div className="fixed bottom-0 w-full md:left-320 bg-gray-800 p-4 flex flex-row justify-between space-x-2 sm:space-x-4 md:w-[calc(100%-320px)]">
      <div className="bg-gray-600 h-10 w-1/2 rounded-lg animate-pulse"></div>
      <div className="bg-gray-600 h-10 w-1/2 rounded-lg animate-pulse"></div>
    </div>
  );

  const SkeletonChatBox = ({ isLeft }) => (
    <div className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
      <div className="bg-gray-800 rounded-lg p-3 space-y-2 md:w-1/3 w-52 animate-pulse">
        <div className="h-6 w-20 bg-gray-600 rounded"></div>
        <div className="h-6 w-16 bg-gray-600 rounded"></div>
        <div className="h-4 w-12 bg-gray-600 rounded self-end"></div>
      </div>
    </div>
  );

  const SkeletonChatList = () => (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <SkeletonChatBox key={index} isLeft={index % 2 === 0} />
        ))}
    </div>
  );

  return (
    <>
      {/* <SkeletonProfile /> */}
      <div className="flex-1 mt-10 pb-24 md:pb-24 pt-24 md:pt-28 sm:pb-24 mx-auto w-full p-4 sm:p-6 space-y-6 bg-gray-900">
        <SkeletonChatList />
      </div>
      {/* <SkeletonButtons /> */}
    </>
  );
}

export default TransactionSkeleton;
