import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const nav = useNavigate();

  async function load() {
    const snap = await getDocs(collection(db, "registrations"));
    setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Hapus data?")) return;
    await deleteDoc(doc(db, "registrations", id));
    load();
  }

  async function logout() {
    await signOut(auth);
    nav("/");
  }

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold text-yellow-300">
          Admin Dashboard
        </h1>
        <button onClick={logout} className="underline">
          Logout
        </button>
      </div>

      {data.map(d => (
        <div
          key={d.id}
          className="bg-white text-blue-950 p-4 mb-3 rounded"
        >
          <p><b>{d.date}</b> — Batch {d.batch} — Group {d.group}</p>
          <p>No WA PIC: {d.pic_phone}</p>

          <ul className="list-disc ml-5 mt-2">
            {d.participants.map((p, i) => (
              <li key={i}>
                {p.name} {p.is_pic && "(PIC)"}
              </li>
            ))}
          </ul>

          <button
            onClick={() => remove(d.id)}
            className="text-red-600 mt-2 font-bold"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
