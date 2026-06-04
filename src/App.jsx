import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* PAGES */
import Home from "./pages/Home";
import Jadwal from "./pages/Jadwal";
import BatchForm from "./pages/BatchForm";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJadwal from "./pages/AdminJadwal";
import Login from "./pages/Login";

/* =========================
   PROTECTED ROUTE WRAPPER
========================= */
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* =========================
   APP ROUTER
========================= */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* =====================
             LOGIN PAGE
          ===================== */}
          <Route path="/login" element={<Login />} />

          {/* =====================
             PUBLIC / PROTECTED VISITOR
          ===================== */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/jadwal" element={<ProtectedRoute><Jadwal /></ProtectedRoute>} />
          <Route path="/batch/:date/:batch" element={<ProtectedRoute><BatchForm /></ProtectedRoute>} />

          {/* =====================
             ADMIN (HANYA MENGGUNAKAN PIN)
          ===================== */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jadwal" element={<AdminJadwal />} />

          {/* =====================
             FALLBACK
          ===================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
