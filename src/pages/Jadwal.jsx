import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { 
  FaWhatsapp, 
  FaClock, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUsers,
  FaExclamationTriangle,
  FaArrowRight
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const ADMIN_WA = "628131073719"; // GANTI NO ADMIN

/* =======================
   BATCH LIST
======================= */
const BATCHES = [
  { id: 1, time: "08.45 - 11.00" },
  { id: 2, time: "09.45 - 12.00" },
  { id: 3, time: "12.45 - 15.00" },
  { id: 4, time: "13.45 - 16.00" },
  { id: 5, time: "15.45 - 18.00" }
];

export default function Jadwal() {
  const navigate = useNavigate();

  const [dates, setDates] = useState([]);
  const [visits, setVisits] = useState({});

  /* =======================
     LOAD JADWAL MANUAL
  ======================= */
  useEffect(() => {
    const jadwalRef = ref(db, "jadwal");

    return onValue(jadwalRef, snap => {
      const val = snap.val() || {};
      setDates(Object.keys(val).sort());
    });
  }, []);

  /* =======================
     LOAD REGISTRATIONS
  ======================= */
  useEffect(() => {
    const visitsRef = ref(db, "registrations");

    return onValue(visitsRef, snapshot => {
      setVisits(snapshot.val() || {});
    });
  }, []);

  /* =======================
     CEK BATCH FULL
  ======================= */
  function isBatchFull(date, batchId) {
    let count = 0;

    Object.values(visits).forEach(d => {
      if (d.date === date && d.batch === batchId) {
        count += Number(d.count || 0);
      }
    });

    return count >= 18;
  }

  /* =======================
     CEK HARI FULL
  ======================= */
  function isDayFull(date) {
    return BATCHES.every(b => isBatchFull(date, b.id));
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-4 py-6 sm:py-8 text-white relative">
      {/* LOGO */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <Logo />
      </div>

      {/* PAGE TITLE */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8 text-center">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
          <FaCalendarAlt className="text-yellow-300 text-2xl" />
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-300">
            Pilih Jadwal Kunjungan
          </h1>
        </div>
      </div>

      {/* INFO ADMIN */}
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-50 to-yellow-100 text-blue-950 p-5 sm:p-6 rounded-3xl shadow-2xl border-2 border-yellow-200 mb-8 sm:mb-10">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-green-100 rounded-2xl shrink-0">
            <FaWhatsapp className="text-green-600" size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-yellow-600" />
              <p className="font-bold text-lg">Butuh Bantuan?</p>
            </div>
            <p className="text-sm sm:text-base text-blue-800 mb-3">
              Jika jadwal penuh atau batch tidak bisa dipilih,
              silakan hubungi admin untuk mendapatkan bantuan.
            </p>
            <a
              href={`https://wa.me/${ADMIN_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <FaWhatsapp />
              <span>Hubungi Admin via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* JADWAL */}
      {dates.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <FaCalendarAlt className="text-yellow-300 text-5xl mx-auto mb-4" />
            <p className="text-xl font-semibold text-blue-200 mb-2">
              Belum Ada Jadwal Tersedia
            </p>
            <p className="text-sm text-blue-300">
              Silakan hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {dates.map(date => {
            const dayFull = isDayFull(date);

            return (
              <div
                key={date}
                className="bg-white text-blue-950 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-blue-100 space-y-5 transform transition-all hover:shadow-3xl hover:scale-[1.02]"
              >
                {/* DATE HEADER */}
                <div className="text-center pb-4 border-b-2 border-blue-100">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaCalendarAlt className="text-blue-600 text-xl" />
                    <h2 className="font-bold text-xl sm:text-2xl">{date}</h2>
                  </div>
                  {dayFull && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      <FaTimesCircle />
                      <span>SEMUA BATCH PENUH</span>
                    </div>
                  )}
                </div>

                {/* BATCHES */}
                <div className="space-y-3">
                  {BATCHES.map(b => {
                    const full = isBatchFull(date, b.id);

                    return (
                      <button
                        key={b.id}
                        disabled={full}
                        onClick={() =>
                          !full && navigate(`/batch/${date}/${b.id}`)
                        }
                        className={`
                          w-full p-4 rounded-xl text-sm text-left
                          transition-all duration-200 flex justify-between items-center
                          transform
                          ${
                            full
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300"
                              : "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-950 hover:to-blue-900 hover:text-yellow-300 border-2 border-blue-200 hover:border-yellow-300 active:scale-[0.98] shadow-md hover:shadow-lg"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-lg
                            ${full 
                              ? "bg-gray-300" 
                              : "bg-blue-600 text-white"
                            }
                          `}>
                            <FaUsers className="text-sm" />
                          </div>
                          <div>
                            <p className="font-bold text-base">Batch {b.id}</p>
                            <p className={`text-xs flex items-center gap-1.5 ${
                              full ? "text-gray-500" : "text-blue-600"
                            }`}>
                              <FaClock className="text-xs" /> 
                              <span>{b.time}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {full ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                              <FaTimesCircle />
                              <span>PENUH</span>
                            </div>
                          ) : (
                            <div className="p-2 bg-yellow-300 text-blue-950 rounded-lg">
                              <FaArrowRight className="text-sm" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING WA */}
      <a
        href={`https://wa.me/${ADMIN_WA}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-6 right-4 sm:right-6
          bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
          text-white p-4 sm:p-5 rounded-full shadow-2xl z-50
          transform transition-all duration-200 hover:scale-110 active:scale-95
          border-2 border-white/20
          animate-pulse hover:animate-none
        "
        aria-label="Hubungi Admin via WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
}
