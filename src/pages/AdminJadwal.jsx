import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJadwal, addJadwal, deleteJadwal } from "../services/api";

export default function AdminJadwal() {
  const [dates, setDates] = useState({});
  const [bulkDates, setBulkDates] = useState("");
  const navigate = useNavigate();

  /* ===== PROTECT ROUTE ===== */
  useEffect(() => {
    if (localStorage.getItem("admin_pin") !== "logged_in") {
      navigate("/admin");
    }
  }, [navigate]);

  async function loadData() {
    try {
      const res = await getJadwal();
      const arr = Array.isArray(res) ? res : [];
      const dMap = {};
      arr.forEach(d => {
        dMap[d.id] = true;
      });
      setDates(dMap);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function processBulkDates() {
    if (!bulkDates.trim()) {
      alert("Masukkan data tanggal terlebih dahulu!");
      return;
    }

    const lines = bulkDates.split(/\n/);
    const validDates = [];
    
    lines.forEach(line => {
      const d = line.trim();
      if (d.length >= 8) {
        const cleanDate = d.replace(/[\r\n\t]/g, '');
        validDates.push(cleanDate);
      }
    });

    if (validDates.length === 0) {
      alert("Tidak ada tanggal valid yang ditemukan.");
      return;
    }

    if (!confirm(`Tambahkan ${validDates.length} jadwal tanggal?`)) return;

    try {
      // json-server tak mendukung bulk POST di default setup, kita loop saja.
      for (const d of validDates) {
        await addJadwal(d);
      }
      setBulkDates("");
      alert(`${validDates.length} jadwal berhasil ditambahkan!`);
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function deleteDate(date) {
    if (!confirm(`Hapus jadwal ${date}?`)) return;
    try {
      await deleteJadwal(date);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-300 mb-6">
        Atur Jadwal Manual
      </h1>

      {/* BULK ADD DATES (EXCEL PASTE) */}
      <div className="space-y-4 mb-10">
        <div className="bg-blue-900/50 p-4 rounded-xl border border-blue-800">
          <p className="text-sm text-yellow-100 font-semibold mb-2">
            💡 Tips: Anda bisa Copy baris/kolom dari Excel dan Paste langsung ke sini.
          </p>
          <p className="text-xs text-blue-200 mb-3">
            Format yang disarankan: YYYY-MM-DD (contoh: 2025-12-30). Setiap baris akan dihitung sebagai 1 jadwal.
          </p>
          <textarea
            rows={6}
            value={bulkDates}
            onChange={e => setBulkDates(e.target.value)}
            placeholder="2025-12-30&#10;2025-12-31&#10;2026-01-01"
            className="
              w-full p-3 rounded
              bg-blue-950 text-white
              border-2 border-yellow-400
              placeholder-gray-500
              focus:outline-none
              focus:ring-2 focus:ring-yellow-400
            "
          />

          <button
            onClick={processBulkDates}
            className="
              w-full mt-3 bg-yellow-400 text-blue-950
              font-bold py-3 rounded
              hover:bg-yellow-300 transition shadow-lg
            "
          >
            ➕ Tambahkan Jadwal Massal
          </button>
        </div>
      </div>

      {/* LIST DATE */}
      <h2 className="text-xl font-bold text-white mb-4 border-b border-blue-800 pb-2">
        Jadwal Tersedia
      </h2>
      
      {Object.keys(dates).length === 0 && (
        <p className="text-gray-400 italic">Belum ada jadwal yang ditambahkan.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {Object.keys(dates)
          .sort()
          .map(date => (
            <div
              key={date}
              className="
                bg-white text-blue-950
                p-4 rounded-xl shadow-md
                flex justify-between items-center
                border-l-4 border-yellow-400
              "
            >
              <span className="font-bold font-mono text-lg">{date}</span>
              <button
                onClick={() => deleteDate(date)}
                className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded"
              >
                Hapus
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
