import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export default function BatchForm() {
  const { date, batch } = useParams();
  const [used, setUsed] = useState({ 1: 0, 2: 0, 3: 0 });

  async function loadUsed() {
    const q = query(
      collection(db, "registrations"),
      where("date", "==", date),
      where("batch", "==", Number(batch))
    );

    const snap = await getDocs(q);
    const temp = { 1: 0, 2: 0, 3: 0 };

    snap.forEach(d => {
      const data = d.data();
      temp[data.group] += data.count;
    });

    setUsed(temp);
  }

  useEffect(() => {
    loadUsed();
  }, []);

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white space-y-6">
      <h1 className="text-xl font-bold">
        {date} — Batch {batch}
      </h1>

      {[1, 2, 3].map(group => (
        <GroupForm
          key={group}
          date={date}
          batch={Number(batch)}
          group={group}
          used={used[group]}
          reload={loadUsed}
        />
      ))}
    </div>
  );
}

function GroupForm({ date, batch, group, used, reload }) {
  const remaining = 18 - used;
  const [count, setCount] = useState(1);
  const [names, setNames] = useState([""]);
  const [phone, setPhone] = useState("");

  if (remaining <= 0) {
    return (
      <div className="bg-gray-700 p-4 rounded">
        Group {group} — PENUH
      </div>
    );
  }

  async function submit() {
    try {
      if (names.length !== count || names.some(n => !n)) {
        alert("Nama peserta belum lengkap");
        return;
      }

      if (!phone) {
        alert("No WA PIC wajib");
        return;
      }

      await addDoc(collection(db, "registrations"), {
        date,
        batch,
        group,
        count,
        pic_phone: phone,
        participants: names.map((n, i) => ({
          name: n,
          is_pic: i === 0,
        })),
        createdAt: new Date(),
      });

      alert("Pendaftaran berhasil");
      reload();
      setNames([""]);
      setPhone("");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Gagal menyimpan data");
    }
  }

  return (
    <div className="bg-white text-blue-950 p-4 rounded-xl space-y-3">
      <h3 className="font-bold">
        Group {group} — {used}/18
      </h3>

      <select
        value={count}
        onChange={e => {
          const val = Number(e.target.value);
          setCount(val);
          setNames(Array(val).fill(""));
        }}
        className="w-full p-2 border rounded"
      >
        {Array.from({ length: remaining }, (_, i) => i + 1).map(v => (
          <option key={v} value={v}>
            {v} Orang
          </option>
        ))}
      </select>

      {names.map((n, i) => (
        <input
          key={i}
          placeholder={i === 0 ? "Nama PIC" : `Nama Peserta ${i + 1}`}
          value={n}
          onChange={e => {
            const copy = [...names];
            copy[i] = e.target.value;
            setNames(copy);
          }}
          className="w-full p-2 border rounded"
        />
      ))}

      <input
        placeholder="No WhatsApp PIC"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        type="button"
        onClick={submit}
        className="w-full bg-blue-950 text-yellow-300 py-2 rounded font-bold"
      >
        Simpan
      </button>
    </div>
  );
}
