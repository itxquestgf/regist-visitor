import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase"; // pastikan ini meng-export `db` Realtime
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // LOAD DATA REALTIME
  useEffect(() => {
    const visitsRef = ref(db, "registrations");
    const unsubscribe = onValue(visitsRef, snapshot => {
      const val = snapshot.val() || {};
      const arr = Object.entries(val).map(([id, item]) => ({ id, ...item }));
      setData(arr);
    });

    return () => unsubscribe();
  }, []);

  // DELETE DATA
  function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    remove(ref(db, `registrations/${id}`));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  // FILTER DATA BERDASARKAN SEARCH
  const filteredData = data.filter(d => {
    const keyword = search.toLowerCase();
    const participants = d.participants?.map(p => p.name.toLowerCase()).join(" ") || "";
    return (
      d.pic_phone?.includes(keyword) ||
      participants.includes(keyword) ||
      d.date?.includes(keyword) ||
      d.batch?.toString() === keyword ||
      d.group?.toString() === keyword
    );
  });

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

{/* SEARCH BAR */}
<div className="mb-6">
  <input
    type="text"
    placeholder="Cari peserta, PIC, No WA, tanggal, batch, atau group..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="w-full p-3 rounded-lg border-2 border-yellow-300 text-white placeholder-yellow-200 
               bg-blue-950 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:text-white"
  />
</div>



      {filteredData.length === 0 && <p>Tidak ada data</p>}

      {filteredData.map(d => (
        <div key={d.id} className="bg-white text-blue-950 p-4 mb-4 rounded-xl">
          <p><b>Tanggal:</b> {d.date}</p>
          <p><b>Batch:</b> {d.batch}</p>
          <p><b>Group:</b> {d.group}</p>
          <p><b>No WA PIC:</b> {d.pic_phone}</p>

          <p className="mt-2 font-bold">Peserta</p>
          <ul className="list-disc ml-5">
            {d.participants?.map((p, i) => (
              <li key={i}>
                {p.name} {p.is_pic && "(PIC)"}
              </li>
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
  );
}
