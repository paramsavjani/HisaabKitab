import { DashboardContext } from "./DashboardContext.js";
import React from "react";

const DashboardContextProvider = ({ children }) => {
  const [activeFriends, setActiveFriends] = React.useState([]);

  return (
    <DashboardContext.Provider
      value={{
        activeFriends,
        setActiveFriends,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContextProvider;
