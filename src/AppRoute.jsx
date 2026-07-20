import { Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import Home from "./pages/Home";
import AdminLogin from "./components/admin/AdminLogin";
import ProtectedRoute from "./ProtectedRoute";

function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<AdminLogin />} />
    </Routes>
  );
}

export default AppRoute;