import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get } from "firebase/database";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  async function submit() {
    if (pin.length !== 4) return alert("PIN harus 4 digit");

    try {
      const snap = await get(ref(db, `admins/${pin}`));
      if (!snap.exists()) return alert("PIN salah");

      // Simpan session sederhana (misal di localStorage)
      localStorage.setItem("admin_pin", pin);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Terjadi error, coba lagi");
    }
  }

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-72 space-y-4">
        <h1 className="text-xl font-bold text-center text-blue-950">
          Admin PIN
        </h1>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          className="w-full p-3 text-center tracking-widest border rounded"
          placeholder="••••"
          value={pin}
          onChange={e =>
            setPin(e.target.value.replace(/\D/g, ""))
          }
        />

        <button
          onClick={submit}
          className="w-full bg-blue-950 text-yellow-300 py-2 rounded font-bold"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
