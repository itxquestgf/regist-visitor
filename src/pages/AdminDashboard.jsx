import { useEffect, useState } from "react";
import { getRegistrations, getJadwal, deleteRegistration } from "../services/api";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { FaCalendarDay, FaCircle, FaCopy, FaSync } from "react-icons/fa";

/* =======================
   EXPORT CSV (HORIZONTAL)
======================= */
function downloadByDate(date, records) {
  const rows = [
    ["Tanggal", "Batch", "Nama PIC", "WhatsApp", "Email", "Total Peserta", "Daftar Peserta (Dipisahkan koma)"]
  ];

  records.forEach(r => {
    const participants = r.participants.map(p => p.name).join(", ");
    rows.push([
      r.date,
      `Batch ${r.batch}`,
      r.participants[0]?.name || "-",
      r.pic_phone,
      r.pic_email || "-",
      r.count,
      `"${participants}"`
    ]);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `kunjungan-${date}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

/* =======================
   DASHBOARD
======================= */
export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [jadwalDates, setJadwalDates] = useState([]);
  const [search, setSearch] = useState("");

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const navigate = useNavigate();

  /* ===== PROTECT ROUTE ===== */
  useEffect(() => {
    if (localStorage.getItem("admin_pin") !== "logged_in") {
      navigate("/admin");
    }
  }, [navigate]);

  /* ===== FETCH DATA FROM API ===== */
  async function loadData() {
    try {
      const regList = await getRegistrations();
      const jadwalList = await getJadwal();

      const arr = Array.isArray(regList) ? regList : [];
      arr.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (a.batch !== b.batch) return a.batch - b.batch;
        return a.group - b.group;
      });
      setData(arr);

      const jList = Array.isArray(jadwalList) ? jadwalList : [];
      setJadwalDates(jList.map(j => j.id).sort());
    } catch (e) {
      console.error(e);
      alert("Gagal memuat data dari server lokal.");
    }
  }

  useEffect(() => {
    loadData();
    
    // Auto-refresh setiap 5 detik untuk mensimulasikan realtime ringan
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    try {
      await deleteRegistration(id);
      loadData();
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  /* ===== SEARCH & FILTER BY SELECTED DATE ===== */
  const filtered = data.filter(d => {
    // Filter by selected date if not ALL
    if (selectedDate !== "ALL" && d.date !== selectedDate) return false;

    if (!search) return true;

    const key = search.toLowerCase();
    const peserta = d.participants.map(p => p.name.toLowerCase()).join(" ");

    return (
      d.pic_phone?.includes(key) ||
      peserta.includes(key) ||
      d.date?.includes(key) ||
      d.batch?.toString() === key ||
      d.group?.toString() === key
    );
  });

  /* ===== GROUP BY DATE (from original data to get counts for all dates) ===== */
  const groupedAll = data.reduce((acc, cur) => {
    if (!acc[cur.date]) acc[cur.date] = [];
    acc[cur.date].push(cur);
    return acc;
  }, {});

  /* ===== GROUP FILTERED DATA ===== */
  const groupedFiltered = filtered.reduce((acc, cur) => {
    if (!acc[cur.date]) acc[cur.date] = [];
    acc[cur.date].push(cur);
    return acc;
  }, {});

  /* ===== COPY FUNCTIONS ===== */
  function copyRombonganText(d) {
    let text = `Tanggal: ${d.date}\nBatch: ${d.batch}\nPIC WA: ${d.pic_phone}\nEmail: ${d.pic_email || "-"}\n\nPeserta:\n`;
    d.participants.forEach((p, i) => {
      text += `${i + 1}. ${p.name} ${i === 0 ? "(PIC)" : ""}\n`;
    });
    navigator.clipboard.writeText(text);
    alert(`Data Rombongan berhasil disalin!`);
  }

  function copyBatchText(date, batchId, items) {
    const batchItems = items.filter(d => d.batch === batchId);
    if (batchItems.length === 0) return alert("Tidak ada data di batch ini");

    let text = `Jadwal Kunjungan: ${date} - Batch ${batchId}\n\n`;
    batchItems.forEach((d, index) => {
      text += `--- Rombongan ${index + 1} ---\n`;
      text += `PIC WA: ${d.pic_phone}\n`;
      text += `Email: ${d.pic_email || "-"}\n`;
      text += `Peserta (${d.participants.length} orang):\n`;
      d.participants.forEach((p, i) => {
        text += `${i + 1}. ${p.name} ${i === 0 ? "(PIC)" : ""}\n`;
      });
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    alert(`Data seluruh Batch ${batchId} berhasil disalin!`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 p-4 sm:p-8 text-white">
      <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
        <h1 className="text-lg sm:text-2xl font-bold text-yellow-300">
          Admin Dashboard
        </h1>
        <div className="flex gap-2 sm:gap-4">
          <button onClick={() => navigate("/admin/jadwal")} className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all">
            Atur Jadwal
          </button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all">
            Logout
          </button>
        </div>
      </div>

      <input
        placeholder="Cari peserta / WA / batch / group"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="
          w-full mb-6 p-3 rounded-xl
          bg-blue-900/50 text-white
          border-2 border-yellow-400/50
          placeholder-gray-400
          focus:outline-none
          focus:border-yellow-400
          transition-colors
        "
      />

      {/* FILTER TANGGAL */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-blue-200 mb-3 uppercase tracking-wider">
          Pilih Tanggal Kunjungan
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedDate("ALL")}
            className={`
              shrink-0 px-6 py-3 rounded-xl font-bold transition-all
              ${selectedDate === "ALL" 
                ? "bg-yellow-400 text-blue-950 shadow-lg scale-105" 
                : "bg-blue-900 text-blue-200 hover:bg-blue-800"
              }
            `}
          >
            Semua Tanggal
          </button>
          
          {jadwalDates.map(date => {
            const hasData = groupedAll[date] && groupedAll[date].length > 0;
            const count = hasData ? groupedAll[date].length : 0;
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`
                  shrink-0 px-5 py-3 rounded-xl font-bold transition-all relative
                  flex items-center gap-2
                  ${selectedDate === date 
                    ? "bg-yellow-400 text-blue-950 shadow-lg scale-105" 
                    : "bg-blue-900 text-blue-200 hover:bg-blue-800"
                  }
                `}
              >
                <FaCalendarDay className={selectedDate === date ? "text-blue-900" : "text-blue-400"} />
                <span>{date}</span>
                {hasData && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-md animate-pulse">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {Object.keys(groupedFiltered).length === 0 && (
        <div className="bg-blue-900/30 p-8 rounded-2xl text-center border border-blue-800/50">
          <p className="text-blue-300 text-lg">Tidak ada data pendaftaran yang ditemukan.</p>
        </div>
      )}

      {Object.entries(groupedFiltered).map(([date, items]) => (
        <div key={date} className="mb-8 sm:mb-10 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <FaCalendarDay className="text-yellow-400 text-lg sm:text-xl" />
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-300">
                {date}
              </h2>
              <span className="bg-yellow-400 text-blue-950 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                {items.length} Rombongan (PIC)
              </span>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide bg-white/10 p-1.5 rounded-xl border border-white/20 items-center px-3">
                <span className="text-xs font-bold text-blue-200 whitespace-nowrap">Salin Batch:</span>
                {[...new Set(items.map(i => i.batch))].sort().map(b => (
                  <button
                    key={b}
                    onClick={() => copyBatchText(date, b, items)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all shrink-0"
                    title={`Salin semua grup di Batch ${b}`}
                  >
                    <FaCopy /> B{b}
                  </button>
                ))}
              </div>
              <button
                onClick={() => downloadByDate(date, items)}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-blue-950 px-5 py-3 sm:py-2 rounded-xl text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                📥 Unduh Excel
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d, index) => (
              <div
                key={d.id}
                className="bg-white text-blue-950 p-5 rounded-2xl shadow-xl border-l-4 border-yellow-400 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-3 py-1 rounded-bl-xl font-bold text-xs">
                  Batch {d.batch}
                </div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">Rombongan {index + 1}</p>
                    <p className="font-bold text-lg">{d.pic_phone}</p>
                    {d.pic_email && <p className="text-xs text-blue-500 font-medium break-all">{d.pic_email}</p>}
                  </div>
                  <button
                    onClick={() => copyRombonganText(d)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl transition-colors shadow-sm"
                    title="Salin data peserta rombongan ini"
                  >
                    <FaCopy className="text-lg" />
                  </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl mb-4">
                  <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Daftar Peserta ({d.participants.length})</p>
                  <ul className="space-y-1">
                    {d.participants.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium">
                        <span className="font-bold text-blue-500 w-4 shrink-0">{i + 1}.</span>
                        <span className={i === 0 ? "font-bold text-blue-900" : "text-gray-700"}>
                          {p.name} {i === 0 && <span className="text-blue-500 ml-1">(PIC)</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleDelete(d.id)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm py-2 rounded-xl transition-colors"
                >
                  Hapus Pendaftaran
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
