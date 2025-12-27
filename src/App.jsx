import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

/* PAGES */
import Home from "./pages/Home";
import Jadwal from "./pages/Jadwal";
import BatchForm from "./pages/BatchForm";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

/* =========================
   PROTECTED ADMIN ROUTE
========================= */
function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

/* =========================
   APP ROUTER
========================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* JADWAL */}
        <Route path="/jadwal" element={<Jadwal />} />

        {/* BATCH FORM */}
        <Route path="/batch/:date/:batch" element={<BatchForm />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
