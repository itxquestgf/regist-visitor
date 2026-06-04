import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { FaCalendarDay, FaCircle } from "react-icons/fa";

/* =======================
   EXPORT CSV (HORIZONTAL)
======================= */
function downloadByDate(date, records) {
  // BATCH 1–5, GROUP 1–3
  const batches = [1, 2, 3, 4, 5];
  const groups = [1, 2, 3];

  // Susun kolom: Batch x Group
  const columns = [];
  batches.forEach(b =>
    groups.forEach(g =>
      columns.push({ batch: b, group: g })
    )
  );

  const rows = [];

  // ROW 1 → TANGGAL
  rows.push([date]);

  // ROW 2 → BATCH
  rows.push(
    columns.map(c => `Batch ${c.batch}`)
  );

  // ROW 3 → GROUP
  rows.push(
    columns.map(c => `Group ${c.group}`)
  );

  // Ambil peserta per kolom
  const colParticipants = columns.map(c => {
    return records
      .filter(r => r.batch === c.batch && r.group === c.group)
      .flatMap(r => r.participants.map(p => p.name));
  });

  // Cari jumlah baris terbanyak
  const maxLen = Math.max(...colParticipants.map(c => c.length), 0);

  // ROW 4+ → PESERTA
  for (let i = 0; i < maxLen; i++) {
    rows.push(
      colParticipants.map(c => c[i] || "")
    );
  }

  // CSV EXPORT
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
  const [selectedDate, setSelectedDate] = useState("ALL");
  const navigate = useNavigate();

  /* ===== LOAD REALTIME ===== */
  useEffect(() => {
    const regRef = ref(db, "registrations");

    return onValue(regRef, snap => {
      const val = snap.val() || {};

      const arr = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
        participants: Array.isArray(v.participants)
          ? v.participants
          : Object.values(v.participants || {})
      }));

      arr.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (a.batch !== b.batch) return a.batch - b.batch;
        return a.group - b.group;
      });

      setData(arr);
    });
  }, []);

  /* ===== LOAD JADWAL ===== */
  useEffect(() => {
    const jadwalRef = ref(db, "jadwal");
    return onValue(jadwalRef, snap => {
      const val = snap.val() || {};
      setJadwalDates(Object.keys(val).sort());
    });
  }, []);

  function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    remove(ref(db, `registrations/${id}`));
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

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-yellow-300">
          Admin Dashboard
        </h1>
        <button onClick={handleLogout} className="underline text-sm">
          Logout
        </button>
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
        <div key={date} className="mb-10 bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <FaCalendarDay className="text-yellow-400 text-xl" />
              <h2 className="text-2xl font-bold text-yellow-300">
                {date}
              </h2>
            </div>

            <button
              onClick={() => downloadByDate(date, items)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-blue-950 px-5 py-2 rounded-xl text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              📥 Unduh Excel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(d => (
              <div
                key={d.id}
                className="bg-white text-blue-950 p-5 rounded-2xl shadow-xl border-l-4 border-yellow-400 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-3 py-1 rounded-bl-xl font-bold text-xs">
                  Batch {d.batch}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Group {d.group}</p>
                  <p className="font-bold text-lg">{d.pic_phone}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl mb-4">
                  <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Daftar Peserta ({d.participants.length})</p>
                  <ul className="space-y-1">
                    {d.participants.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium">
                        <FaCircle className="text-[6px] text-blue-400" />
                        <span className={i === 0 ? "font-bold text-blue-900" : ""}>
                          {p.name} {i === 0 && "(PIC)"}
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
