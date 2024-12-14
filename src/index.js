import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./Layout";
import "./index.css";
import Signup from "./Components/Signup";
import Login from "./Components/Login";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import NotFound from "./Components/NotFound";
import AboutUs from "./Components/AboutUs";
import Home from "./Components/Home";
import UserContext from "./context/UserContext";
import FeaturesSection from "./Components/FeaturesSection";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="features" element={<FeaturesSection />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="about" element={<AboutUs />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <UserContext.Provider value={{ user: null }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  </>
);
