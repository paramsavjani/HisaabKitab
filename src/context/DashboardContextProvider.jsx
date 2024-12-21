import { DashboardContext } from "./DashboardContext.js";
import React from "react";

const DashboardContextProvider = ({ children }) => {
  const [activeFriends, setActiveFriends] = React.useState([]);
  const [totalGive, setTotalGive] = React.useState(0);
  const [totalTake, setTotalTake] = React.useState(0);

  return (
    <DashboardContext.Provider
      value={{
        activeFriends,
        setActiveFriends,
        totalGive,
        setTotalGive,
        totalTake,
        setTotalTake,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContextProvider;
