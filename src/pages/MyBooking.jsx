import { useEffect, useState } from "react";
import { getRegistrations, deleteRegistration, createLog } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { FaTrash, FaArrowLeft, FaCalendarCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MyBooking() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadMyBookings() {
    setLoading(true);
    try {
      const allRegs = await getRegistrations();
      if (!Array.isArray(allRegs)) return;
      
      // Filter by current user's email
      const mine = allRegs.filter(r => r.pic_email === currentUser.email);
      setMyBookings(mine);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadMyBookings();
    }
  }, [currentUser]);

  async function handleCancelBooking(id) {
    if (!confirm("Apakah Anda yakin ingin membatalkan pendaftaran ini? Slot Anda akan hangus.")) {
      return;
    }
    
    try {
      await deleteRegistration(id);
      
      try {
        await createLog({
          action: "DELETE",
          actor: currentUser?.email || "Visitor",
          target: `Booking ID: ${id}`,
          details: `User membatalkan booking`
        });
      } catch(err) {
        console.error("Gagal mencatat log", err);
      }

      alert("Pendaftaran berhasil dibatalkan.");
      loadMyBookings();
    } catch (e) {
      alert("Gagal membatalkan pendaftaran: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-4 py-8 text-white relative">
      {/* LOGO */}
      <div className="flex justify-center mb-8">
        <Logo />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-300 flex items-center gap-3">
            <FaCalendarCheck /> Tiket Saya
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-blue-300 animate-pulse font-bold text-lg">
            Memuat data...
          </div>
        ) : myBookings.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center border border-white/20 shadow-2xl">
            <FaCalendarCheck className="text-6xl text-blue-400/50 mx-auto mb-4" />
            <p className="text-xl font-bold text-blue-200 mb-2">Anda belum memiliki jadwal kunjungan.</p>
            <p className="text-blue-300/80 mb-6">Silakan pilih jadwal untuk mulai mendaftar kunjungan ke pabrik kami.</p>
            <button 
              onClick={() => navigate("/jadwal")}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-6 py-3 rounded-xl font-black shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Lihat Jadwal
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {myBookings.map((b, i) => (
              <div key={b.id || i} className="bg-white text-blue-950 rounded-2xl p-6 shadow-xl border-l-4 border-yellow-400 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-bl-xl font-black text-sm shadow-sm">
                  Batch {b.batch}
                </div>
                <p className="text-sm text-gray-500 font-bold mb-1 uppercase tracking-wider">Tanggal Kunjungan</p>
                <p className="font-black text-2xl mb-4 text-blue-600">{b.date}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium text-sm">Nama PIC</span>
                    <span className="font-bold text-sm text-right">{b.participants?.[0]?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium text-sm">No WhatsApp</span>
                    <span className="font-bold text-sm text-right">{b.pic_phone || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium text-sm">Total Peserta</span>
                    <span className="font-bold text-sm text-right bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{b.count || b.participants?.length || 0} Orang</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleCancelBooking(b.id)}
                  className="w-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:border-transparent"
                >
                  <FaTrash /> Batalkan Kunjungan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
