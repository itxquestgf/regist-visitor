import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center gap-6 relative">
      
      {/* HEADER: USER PROFILE & LOGOUT */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2 text-yellow-300">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-yellow-300" />
          ) : (
            <FaUserCircle className="text-2xl" />
          )}
          <span className="font-semibold text-sm hidden sm:inline">{currentUser?.displayName || currentUser?.email}</span>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-red-500/50"
        >
          <FaSignOutAlt />
          <span>Keluar</span>
        </button>
      </div>

      <Logo />

      <button
        onClick={() => navigate("/jadwal")}
        className="bg-yellow-300 hover:bg-yellow-400 text-blue-950 px-8 py-4 rounded-xl font-black text-xl shadow-lg transform transition-all hover:scale-105 active:scale-95"
      >
        Mulai Kunjungan
      </button>
    </div>
  );
}
