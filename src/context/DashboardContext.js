import React, { useContext } from "react";

const DashboardContext = React.createContext();

export default function useDashboardContext() {
  return useContext(DashboardContext);
}

export { DashboardContext };