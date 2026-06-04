import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { 
  FaWhatsapp, 
  FaClock, 
  FaCalendarAlt, 
  FaCalendarDay,
  FaCheckCircle, 
  FaTimesCircle,
  FaUsers,
  FaExclamationTriangle,
  FaArrowRight
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { getRegistrations } from "../services/api";

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
  const [visits, setVisits] = useState([]);

  // Fungsi helper untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  /* =======================
     LOAD DATA FROM API
  ======================= */
  async function loadData() {
    try {
      // Generate 30 days starting from today
      const generatedDates = new Set();
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        generatedDates.add(`${yyyy}-${mm}-${dd}`);
      }

      const sortedDates = Array.from(generatedDates).sort();
      setDates(sortedDates);

      // JIKA hari ini belum ada jadwalnya, jangan biarkan blank, kembalikan ke "ALL"
      setSelectedDate(prev => {
        if (prev === getTodayDate() && !sortedDates.includes(getTodayDate())) {
          return "ALL";
        }
        return prev;
      });

      const rList = await getRegistrations();
      const rArr = Array.isArray(rList) ? rList : [];
      setVisits(rArr);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  /* =======================
     CEK BATCH AVAILABILITY
  ======================= */
  function getBatchAvailability(date, batchId) {
    let count = 0;

    visits.forEach(d => {
      if (d.date === date && d.batch === batchId) {
        count += Number(d.count || 0);
      }
    });

    const capacity = 54; // 3 grup x 18 orang
    const remaining = capacity - count;
    
    return {
      used: count,
      capacity,
      remaining: remaining > 0 ? remaining : 0,
      full: count >= capacity
    };
  }

  /* =======================
     CEK HARI FULL
  ======================= */
  function isDayFull(date) {
    return BATCHES.every(b => getBatchAvailability(date, b.id).full);
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
        <div className="max-w-6xl mx-auto">
          {/* FILTER TANGGAL */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-blue-200 mb-3 uppercase tracking-wider text-center sm:text-left">
              Filter Tanggal Kunjungan
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-start sm:justify-center lg:justify-start">
              <button
                onClick={() => setSelectedDate("ALL")}
                className={`
                  shrink-0 px-6 py-3 rounded-xl font-bold transition-all
                  ${selectedDate === "ALL" 
                    ? "bg-yellow-400 text-blue-950 shadow-lg scale-105" 
                    : "bg-white/10 text-blue-100 hover:bg-white/20 border border-white/20"
                  }
                `}
              >
                Semua Tanggal
              </button>
              
              {dates.map(date => {
                // Hitung jumlah pendaftar di tanggal ini
                let count = 0;
                Object.values(visits).forEach(d => {
                  if (d.date === date) count++;
                });
                
                const hasData = count > 0;
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      shrink-0 px-5 py-3 rounded-xl font-bold transition-all relative
                      flex items-center gap-2
                      ${selectedDate === date 
                        ? "bg-yellow-400 text-blue-950 shadow-lg scale-105" 
                        : "bg-white/10 text-blue-100 hover:bg-white/20 border border-white/20"
                      }
                    `}
                  >
                    <FaCalendarDay className={selectedDate === date ? "text-blue-900" : "text-yellow-300"} />
                    <span>{date}</span>
                    {hasData && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-md animate-pulse border-2 border-blue-950">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* JADWAL LIST */}
          {dates.filter(date => selectedDate === "ALL" || date === selectedDate).length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xl text-yellow-300 font-bold mb-2">Tidak ada jadwal untuk tanggal ini</p>
              <p className="text-sm text-blue-200">Silakan pilih tanggal lain atau "Semua Tanggal".</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dates
                .filter(date => selectedDate === "ALL" || date === selectedDate)
                .map(date => {
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
                    const status = getBatchAvailability(date, b.id);
                    const full = status.full;

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
                            <div className={`text-xs flex flex-col gap-0.5 mt-0.5 ${
                              full ? "text-gray-500" : "text-blue-600"
                            }`}>
                              <span className="flex items-center gap-1.5"><FaClock className="text-xs" /> {b.time}</span>
                              <span className={`font-semibold ${full ? "" : "text-green-600"}`}>
                                Sisa {status.remaining} slot peserta
                              </span>
                            </div>
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
