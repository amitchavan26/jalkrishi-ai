import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../api";
import Landing from "../pages/Landing";

export default function RootSwitch() {
  return getToken() ? <Navigate to="/dashboard" replace /> : <Landing />;
}
