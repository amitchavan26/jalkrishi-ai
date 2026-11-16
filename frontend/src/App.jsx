import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RootSwitch from "./components/RootSwitch";
import Dashboard from "./pages/Dashboard";
import Farms from "./pages/Farms";
import Assess from "./pages/Assess";
import Result from "./pages/Result";
import Compare from "./pages/Compare";
import Alerts from "./pages/Alerts";
import History from "./pages/History";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootSwitch />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="assess" element={<Assess />} />
        <Route path="assessments/:id" element={<Result />} />
        <Route path="compare" element={<Compare />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
