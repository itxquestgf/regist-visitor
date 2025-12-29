import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* PAGES */
import Home from "./pages/Home";
import Jadwal from "./pages/Jadwal";
import BatchForm from "./pages/BatchForm";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJadwal from "./pages/AdminJadwal"; // ⬅️ PAGE BARU

/* =========================
   APP ROUTER
========================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================
           PUBLIC
        ===================== */}
        <Route path="/" element={<Home />} />
        <Route path="/jadwal" element={<Jadwal />} />
        <Route path="/batch/:date/:batch" element={<BatchForm />} />

        {/* =====================
           ADMIN (LOGIN DIABAIKAN)
        ===================== */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* dashboard langsung bisa */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* setting jadwal manual */}
        <Route path="/admin/jadwal" element={<AdminJadwal />} />

        {/* =====================
           FALLBACK
        ===================== */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
