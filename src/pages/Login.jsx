import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import LogoImage from "../assets/logo.png";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/"); // Arahkan kembali ke home setelah berhasil login
    } catch (err) {
      console.error(err);
      setError("Gagal masuk dengan Google. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-3 rounded-full mb-4 shadow-lg border border-yellow-300">
            <img 
              src={LogoImage} 
              alt="Chocolatos X-Quest" 
              className="w-24 h-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl font-black text-yellow-300 mb-2 tracking-wide drop-shadow-md">
            X-QUEST VISITOR
          </h1>
          <p className="text-blue-200 font-medium text-sm px-4">
            Silakan masuk untuk memilih jadwal kunjungan Anda.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-1 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-gray-800 border-t-transparent rounded-full"></span>
            ) : (
              <FcGoogle className="text-2xl" />
            )}
            <span>{loading ? "Menghubungkan..." : "Lanjutkan dengan Google"}</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-blue-300/60 font-medium">
            Sistem Pendaftaran Pengunjung &copy; 2026<br/>
            ITX Quest - PT Garudafood Putra Putri Jaya Tbk
          </p>
        </div>
      </div>
    </div>
  );
}
