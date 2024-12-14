import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./Layout";
import "./index.css";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Friends from "./Components/Friends";
import NotFound from "./Components/NotFound";
import AboutUs from "./Components/AboutUs";
import Home from "./Components/Home";
import FeaturesSection from "./Components/FeaturesSection";
import UserContextProvider from "./context/UserContextProvider";
import Search from "./Components/Search";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="features" element={<FeaturesSection />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="about" element={<AboutUs />} />
      <Route path="friends" element={<Friends />} />
      <Route path="search" element={<Search />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <UserContextProvider>
      <RouterProvider router={router} />
    </UserContextProvider>
  </>
);
