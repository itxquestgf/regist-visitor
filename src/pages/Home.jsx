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
        <div className="flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-yellow-300 shadow-md object-cover" />
          ) : (
            <FaUserCircle className="text-4xl text-yellow-300" />
          )}
          <div className="flex flex-col">
            <span className="text-xs text-blue-200 font-medium">Halo, selamat datang! 👋</span>
            <span className="font-bold text-sm sm:text-base text-yellow-300 truncate max-w-[150px] sm:max-w-[250px]">
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </span>
          </div>
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

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
        <button
          onClick={() => navigate("/jadwal")}
          className="w-full bg-yellow-300 hover:bg-yellow-400 text-blue-950 px-6 py-4 rounded-xl font-black text-lg shadow-lg transform transition-all hover:scale-105 active:scale-95"
        >
          Mulai Kunjungan
        </button>
        
        <button
          onClick={() => navigate("/my-booking")}
          className="w-full bg-blue-800 hover:bg-blue-700 text-yellow-300 border-2 border-yellow-300/50 px-6 py-4 rounded-xl font-black text-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          Tiket Saya
        </button>
      </div>
    </div>
  );
}
