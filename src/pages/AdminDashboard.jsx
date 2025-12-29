import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

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
  const [search, setSearch] = useState("");
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

  function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    remove(ref(db, `registrations/${id}`));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  /* ===== SEARCH ===== */
  const filtered = data.filter(d => {
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

  /* ===== GROUP BY DATE ===== */
  const grouped = filtered.reduce((acc, cur) => {
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
        placeholder="Cari peserta / WA / tanggal / batch / group"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="
          w-full mb-6 p-3 rounded
          bg-blue-950 text-white
          border-2 border-yellow-400
          placeholder-gray-300
          focus:outline-none
          focus:ring-2 focus:ring-yellow-400
        "
      />

      {Object.keys(grouped).length === 0 && <p>Tidak ada data</p>}

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-yellow-300">
              {date}
            </h2>

            <button
              onClick={() => downloadByDate(date, items)}
              className="bg-yellow-400 text-blue-950 px-3 py-1 rounded text-sm font-bold"
            >
              Unduh
            </button>
          </div>

          {items.map(d => (
            <div
              key={d.id}
              className="bg-white text-blue-950 p-4 mb-4 rounded-xl"
            >
              <p><b>Batch:</b> {d.batch}</p>
              <p><b>Group:</b> {d.group}</p>

              <p className="mt-2 font-bold">Peserta</p>
              <ul className="list-disc ml-5">
                {d.participants.map((p, i) => (
                  <li key={i}>{p.name}</li>
                ))}
              </ul>

              <button
                onClick={() => handleDelete(d.id)}
                className="mt-3 text-red-600 font-bold text-sm"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
