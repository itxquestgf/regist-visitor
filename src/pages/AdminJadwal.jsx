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
    if (!newDate) return;
    set(ref(db, `jadwal/${newDate}`), true);
    setNewDate("");
  }

  function deleteDate(date) {
    if (!confirm(`Hapus jadwal ${date}?`)) return;
    remove(ref(db, `jadwal/${date}`));
  }

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-300 mb-4">
        Atur Jadwal Manual
      </h1>

      {/* ADD DATE */}
      <div className="flex gap-2 mb-6">
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="p-2 rounded text-blue-950"
        />
        <button
          onClick={addDate}
          className="bg-yellow-400 text-blue-950 px-4 rounded font-bold"
        >
          Tambah
        </button>
      </div>

      {/* LIST DATE */}
      {Object.keys(dates).length === 0 && <p>Belum ada jadwal</p>}

      {Object.keys(dates)
        .sort()
        .map(date => (
          <div
            key={date}
            className="bg-white text-blue-950 p-3 rounded mb-2 flex justify-between items-center"
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
