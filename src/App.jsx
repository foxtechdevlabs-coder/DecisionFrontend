import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import WheelPage from "./pages/WheelPage.jsx";
import VoucherPage from "./pages/VoucherPage.jsx";
import WheelQrPage from "./pages/WheelQrPage.jsx";
import VoucherQrPage from "./pages/VoucherQrPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/wheel" element={<WheelPage />} />
      <Route path="/voucher/:code" element={<VoucherPage />} />
      <Route path="/admin/wheel-qr" element={<WheelQrPage />} />
      <Route path="/admin/voucher-qr/:code" element={<VoucherQrPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
