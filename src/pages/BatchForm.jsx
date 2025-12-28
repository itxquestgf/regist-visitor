import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, push, onValue, off } from "firebase/database";
import { db } from "../firebase";
import { FaWhatsapp } from "react-icons/fa";

const ADMIN_WA = "628131073719";

export default function BatchForm() {
  const { date, batch } = useParams();
  const [used, setUsed] = useState({ 1: 0, 2: 0, 3: 0 });

  /* =========================
     LOAD USED QUOTA (REALTIME)
  ========================= */
  useEffect(() => {
    const regRef = ref(db, "registrations");

    const unsub = onValue(regRef, snapshot => {
      const all = snapshot.val() || {};
      const temp = { 1: 0, 2: 0, 3: 0 };

      Object.values(all).forEach(d => {
        if (
          d.date === date &&
          d.batch === Number(batch) &&
          temp[d.group] !== undefined
        ) {
          temp[d.group] += Number(d.count || 0);
        }
      });

      setUsed(temp);
    });

    return () => off(regRef);
  }, [date, batch]);

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white space-y-6 relative">
      <h1 className="text-xl font-bold">
        {date} — Batch {batch}
      </h1>

      {/* INFO ADMIN */}
      <div className="bg-yellow-100 text-blue-950 p-4 rounded-xl flex gap-3">
        <FaWhatsapp size={28} className="text-green-600 mt-1" />
        <div>
          <p className="font-bold">Mengalami kendala pendaftaran?</p>
          <p className="text-sm">
            Jika data tidak tersimpan atau kuota tidak sesuai, hubungi admin.
          </p>
        </div>
      </div>

      {[1, 2, 3].map(group => (
        <GroupForm
          key={group}
          date={date}
          batch={Number(batch)}
          group={group}
          used={used[group]}
        />
      ))}
    </div>
  );
}

/* =========================
   GROUP FORM
========================= */
function GroupForm({ date, batch, group, used }) {
  const remaining = 18 - used;
  const [count, setCount] = useState(1);
  const [names, setNames] = useState([""]);
  const [phone, setPhone] = useState("");

  if (remaining <= 0) {
    return (
      <div className="bg-gray-700 p-4 rounded">
        Group {group} — <b>PENUH</b>
      </div>
    );
  }

  function submit() {
    if (names.length !== count || names.some(n => !n.trim())) {
      alert("Nama peserta belum lengkap");
      return;
    }
    if (!phone.trim()) {
      alert("No WhatsApp PIC wajib diisi");
      return;
    }

    const regRef = ref(db, "registrations");

    push(regRef, {
      date,
      batch,
      group,
      count,
      pic_phone: phone,
      participants: names.map((n, i) => ({
        name: n.trim(),
        is_pic: i === 0,
      })),
      createdAt: Date.now(),
    });

    alert("Pendaftaran berhasil");
    setNames([""]);
    setPhone("");
  }

  return (
    <div className="bg-white text-blue-950 p-4 rounded-xl space-y-3">
      <h3 className="font-bold">
        Group {group} — {used}/18
      </h3>

      <select
        value={count}
        onChange={e => {
          const v = Number(e.target.value);
          setCount(v);
          setNames(Array(v).fill(""));
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
        onClick={submit}
        className="w-full bg-blue-950 text-yellow-300 py-2 rounded font-bold"
      >
        Simpan
      </button>
    </div>
  );
}
