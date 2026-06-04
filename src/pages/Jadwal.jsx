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
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { getRegistrations } from "../services/api";

const ADMIN_WA = "628131073719"; // GANTI NO ADMIN

const BATCHES = [
  { id: 1, time: "08.45 - 11.00" },
  { id: 2, time: "09.45 - 12.00" },
  { id: 3, time: "12.45 - 15.00" },
  { id: 4, time: "13.45 - 16.00" },
  { id: 5, time: "15.45 - 18.00" }
];

export default function Jadwal() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  async function loadData() {
    try {
      const rList = await getRegistrations();
      setVisits(Array.isArray(rList) ? rList : []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Total capacity per day is 5 batches * 54 = 270
  const CAPACITY_PER_BATCH = 54;
  const CAPACITY_PER_DAY = BATCHES.length * CAPACITY_PER_BATCH;

  function getDailyVisits(dateStr) {
    let count = 0;
    visits.forEach(d => {
      if (d.date === dateStr) count += Number(d.count || 0);
    });
    return count;
  }

  function getBatchAvailability(date, batchId) {
    let count = 0;
    visits.forEach(d => {
      if (d.date === date && d.batch === batchId) {
        count += Number(d.count || 0);
      }
    });

    const remaining = CAPACITY_PER_BATCH - count;
    return {
      used: count,
      capacity: CAPACITY_PER_BATCH,
      remaining: remaining > 0 ? remaining : 0,
      full: count >= CAPACITY_PER_BATCH
    };
  }

  /* CALENDAR LOGIC */
  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }
  function prevMonth() {
    // Only allow current month and future months
    const now = new Date();
    if (currentMonth.getFullYear() > now.getFullYear() || (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth())) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }
  }

  function getCalendarCells() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      cells.push({ day: i, dateStr, dateObj: d });
    }
    return cells;
  }

  const cells = getCalendarCells();
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-4 py-6 sm:py-8 text-white relative">
      {/* LOGO */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <Logo />
      </div>

      <div className="max-w-6xl mx-auto mb-6 sm:mb-8 flex flex-col md:flex-row gap-6">
        
        {/* CALENDAR SECTION */}
        <div className="md:w-1/2 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
              <FaCalendarAlt /> {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                disabled={currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()}
                className="p-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              >
                <FaChevronLeft />
              </button>
              <button onClick={nextMonth} className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full transition-colors">
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold text-blue-200 mb-2">
            {weekDays.map(w => <div key={w}>{w}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {cells.map((c, i) => {
              if (!c) return <div key={i} className="p-2"></div>;

              const isPast = c.dateObj < today;
              const isSelected = selectedDate === c.dateStr;
              const count = getDailyVisits(c.dateStr);
              
              // Determine color indicator
              let bgColor = "bg-white/5 hover:bg-white/10";
              let indicatorColor = "bg-green-500"; // Empty / Available
              if (isPast) {
                bgColor = "bg-gray-800/50 opacity-50 cursor-not-allowed";
                indicatorColor = "bg-gray-500";
              } else if (count >= CAPACITY_PER_DAY) {
                bgColor = "bg-red-900/50 hover:bg-red-800/50";
                indicatorColor = "bg-red-500";
              } else if (count >= CAPACITY_PER_DAY / 2) {
                indicatorColor = "bg-yellow-400";
              }

              if (isSelected && !isPast) {
                bgColor = "bg-yellow-400 text-blue-950 scale-105 shadow-lg shadow-yellow-400/20";
              }

              return (
                <button
                  key={c.dateStr}
                  disabled={isPast}
                  onClick={() => setSelectedDate(c.dateStr)}
                  className={`relative p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center border border-transparent ${isSelected ? "border-yellow-200" : "hover:border-white/20"} ${bgColor}`}
                >
                  <span className={`text-base font-bold ${isSelected ? "text-blue-950" : "text-white"}`}>
                    {c.day}
                  </span>
                  {!isPast && (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`}></div>
                      {count > 0 && <span className={`text-[9px] font-black ${isSelected ? "text-blue-900" : "text-blue-200"}`}>{count}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className="mt-6 flex justify-center gap-4 text-xs font-semibold text-blue-200">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Tersedia</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Mulai Penuh</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Penuh</div>
          </div>
        </div>

        {/* SELECTED DATE BATCHES */}
        <div className="md:w-1/2">
          {selectedDate ? (
            <div className="bg-white text-blue-950 rounded-3xl p-6 shadow-2xl border-2 border-blue-100">
              <div className="text-center pb-4 border-b-2 border-blue-100 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaCalendarDay className="text-blue-600 text-xl" />
                  <h2 className="font-bold text-2xl">{selectedDate}</h2>
                </div>
                <p className="text-sm font-bold text-blue-500">Pilih Batch Kunjungan</p>
              </div>

              <div className="space-y-4">
                {BATCHES.map(b => {
                  const status = getBatchAvailability(selectedDate, b.id);
                  const full = status.full;

                  return (
                    <button
                      key={b.id}
                      disabled={full}
                      onClick={() => !full && navigate(`/batch/${selectedDate}/${b.id}`)}
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
                          ${full ? "bg-gray-300" : "bg-blue-600 text-white"}
                        `}>
                          <FaUsers className="text-sm" />
                        </div>
                        <div>
                          <p className="font-bold text-base">Batch {b.id}</p>
                          <div className={`text-xs flex flex-col gap-0.5 mt-0.5 ${full ? "text-gray-500" : "text-blue-600"}`}>
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
          ) : (
            <div className="h-full flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 p-8 text-center">
              <div>
                <FaCalendarDay className="text-4xl text-blue-400 mx-auto mb-3 opacity-50" />
                <p className="text-blue-200 font-bold">Pilih tanggal di kalender<br/>untuk melihat jadwal Batch.</p>
              </div>
            </div>
          )}
        </div>

      </div>

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
