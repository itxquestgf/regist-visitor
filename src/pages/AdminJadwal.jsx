import { useEffect, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "../firebase";

export default function AdminJadwal() {
  const [dates, setDates] = useState({});
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    const jadwalRef = ref(db, "jadwal");
    return onValue(jadwalRef, snap => {
      setDates(snap.val() || {});
    });
  }, []);

  function addDate() {
    if (!newDate) {
      alert("Pilih tanggal terlebih dahulu");
      return;
    }

    set(ref(db, `jadwal/${newDate}`), true);
    setNewDate("");
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

      {/* ADD DATE */}
      <div className="space-y-4 mb-10">
        <div className="relative">
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="
              w-full p-3 pr-10 rounded
              bg-blue-950 text-white
              border-2 border-yellow-400
              placeholder-gray-300
              focus:outline-none
              focus:ring-2 focus:ring-yellow-400
              date-yellow
            "
          />

          {/* ICON KALENDER */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none">
            📅
          </span>
        </div>

        <button
          onClick={addDate}
          className="
            w-full bg-yellow-400 text-blue-950
            font-bold py-3 rounded
            hover:bg-yellow-300 transition
          "
        >
          ➕ Tambahkan Jadwal
        </button>
      </div>

      {/* LIST DATE */}
      {Object.keys(dates).length === 0 && (
        <p className="text-gray-300">Belum ada jadwal</p>
      )}

      {Object.keys(dates)
        .sort()
        .map(date => (
          <div
            key={date}
            className="
              bg-white text-blue-950
              p-3 rounded mb-3
              flex justify-between items-center
            "
          >
            <span className="font-bold">{date}</span>
            <button
              onClick={() => deleteDate(date)}
              className="text-red-600 font-bold"
            >
              Hapus
            </button>
          </div>
        ))}
    </div>
  );
}
