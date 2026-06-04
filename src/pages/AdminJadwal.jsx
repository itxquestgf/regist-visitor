import { useEffect, useState } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";

export default function AdminJadwal() {
  const [dates, setDates] = useState({});
  const [bulkDates, setBulkDates] = useState("");

  useEffect(() => {
    const jadwalRef = ref(db, "jadwal");
    return onValue(jadwalRef, snap => {
      setDates(snap.val() || {});
    });
  }, []);

  function processBulkDates() {
    if (!bulkDates.trim()) {
      alert("Masukkan data tanggal terlebih dahulu!");
      return;
    }

    const lines = bulkDates.split(/\n/);
    const updates = {};
    let count = 0;

    lines.forEach(line => {
      const d = line.trim();
      // Validasi sederhana: pastikan tidak kosong
      // Format yang disarankan: YYYY-MM-DD
      if (d.length >= 8) {
        // Hapus karakter whitespace tersembunyi jika ada (seperti carriage return \r dari excel)
        const cleanDate = d.replace(/[\r\n\t]/g, '');
        updates[cleanDate] = true;
        count++;
      }
    });

    if (count === 0) {
      alert("Tidak ada tanggal valid yang ditemukan.");
      return;
    }

    if (!confirm(`Tambahkan ${count} jadwal tanggal?`)) return;

    update(ref(db, "jadwal"), updates).then(() => {
      setBulkDates("");
      alert(`${count} jadwal berhasil ditambahkan!`);
    }).catch(err => {
      alert("Error: " + err.message);
    });
  }

  function deleteDate(date) {
    if (!confirm(`Hapus jadwal ${date}?`)) return;
    remove(ref(db, `jadwal/${date}`));
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
