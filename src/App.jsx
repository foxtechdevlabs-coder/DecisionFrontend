import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import WheelPage from "./pages/WheelPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/wheel" element={<WheelPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
