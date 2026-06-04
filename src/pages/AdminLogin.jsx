import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaExclamationTriangle } from "react-icons/fa";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0); // Sisa detik cooldown
  const navigate = useNavigate();

  // Load cooldown state
  useEffect(() => {
    const checkCooldown = () => {
      const cooldownUntil = localStorage.getItem("admin_cooldown_until");
      if (cooldownUntil) {
        const remaining = Math.ceil((Number(cooldownUntil) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          setCooldown(0);
          localStorage.removeItem("admin_cooldown_until");
          localStorage.removeItem("admin_failed_attempts");
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  function submit() {
    setError("");

    if (cooldown > 0) {
      setError(`Tunggu ${Math.ceil(cooldown / 60)} menit lagi`);
      return;
    }

    if (!password) {
      setError("Password tidak boleh kosong");
      return;
    }

    if (password === "chocolatos!23") {
      // SUCCESS
      localStorage.setItem("admin_pin", "logged_in");
      localStorage.removeItem("admin_failed_attempts");
      localStorage.removeItem("admin_cooldown_until");
      navigate("/admin/dashboard");
    } else {
      // FAILED
      let attempts = Number(localStorage.getItem("admin_failed_attempts") || 0);
      attempts += 1;

      if (attempts >= 5) {
        // Trigger cooldown 5 menit
        const until = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("admin_cooldown_until", until);
        localStorage.setItem("admin_failed_attempts", attempts);
        setCooldown(5 * 60);
        setError("Login terkunci selama 5 menit");
      } else {
        localStorage.setItem("admin_failed_attempts", attempts);
        setError(`Password salah. Sisa percobaan: ${5 - attempts}`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-blue-100">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg">
            <FaLock className="text-3xl text-blue-950" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-blue-950 mb-2">
          Admin Login
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Masukkan password untuk mengakses dashboard
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
            <FaExclamationTriangle className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="password"
            className={`w-full p-4 text-center tracking-wider border-2 rounded-xl focus:outline-none transition-colors ${
              cooldown > 0 
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" 
                : "border-blue-200 focus:border-blue-500 bg-blue-50/50 text-blue-950"
            }`}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={cooldown > 0}
            onKeyDown={e => e.key === "Enter" && submit()}
          />

          <button
            onClick={submit}
            disabled={cooldown > 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg
              ${cooldown > 0 
                ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none" 
                : "bg-gradient-to-r from-blue-950 to-blue-900 text-yellow-300 hover:from-blue-900 hover:to-blue-800 active:scale-[0.98] border-2 border-yellow-300/20"
              }
            `}
          >
            {cooldown > 0 
              ? `Terkunci (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')})` 
              : "Masuk Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
