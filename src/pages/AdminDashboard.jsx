import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  async function loadData() {
    const snap = await getDocs(collection(db, "visits"));
    const rows = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
    setData(rows);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    await deleteDoc(doc(db, "visits", id));
    loadData();
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  useEffect(() => {
    loadData();
  }, []);

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

      {data.length === 0 && <p>Tidak ada data</p>}

      {data.map(d => (
        <div key={d.id} className="bg-white text-blue-950 p-4 mb-4 rounded-xl">
          <p><b>Tanggal:</b> {d.date}</p>
          <p><b>Batch:</b> {d.batch}</p>
          <p><b>Group:</b> {d.group}</p>
          <p><b>No WA PIC:</b> {d.pic_phone}</p>

          <p className="mt-2 font-bold">Peserta</p>
          <ul className="list-disc ml-5">
            {d.participants.map((p, i) => (
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
