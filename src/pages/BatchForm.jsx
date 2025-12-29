import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, push, onValue, off } from "firebase/database";
import { db } from "../firebase";
import { FaUsers } from "react-icons/fa";

export default function BatchForm() {
  const { date, batch } = useParams();
  const [used, setUsed] = useState({ 1: 0, 2: 0, 3: 0 });

  useEffect(() => {
    const regRef = ref(db, "registrations");

    const unsub = onValue(regRef, snap => {
      const all = snap.val() || {};
      const temp = { 1: 0, 2: 0, 3: 0 };

      Object.values(all).forEach(d => {
        if (d.date === date && d.batch === Number(batch)) {
          temp[d.group] += d.count;
        }
      });

      setUsed(temp);
    });

    return () => off(regRef);
  }, [date, batch]);

  return (
    <div className="min-h-screen bg-blue-950 px-4 py-6 text-white">
      {/* HEADER */}
      <div className="max-w-xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-yellow-300">
          {date}
        </h1>
        <p className="text-sm text-blue-200">
          Batch {batch} • Pendaftaran Peserta
        </p>
      </div>

      {/* GROUP FORMS */}
      <div className="max-w-xl mx-auto space-y-6">
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
    </div>
  );
}

/* =========================
   GROUP FORM
========================= */
function GroupForm({ date, batch, group, used }) {
  const capacity = 18;
  const remaining = capacity - used;

  const [count, setCount] = useState(1);
  const [names, setNames] = useState([""]);
  const [phone, setPhone] = useState("");

  // FEEDBACK STATE
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const percent = Math.min((used / capacity) * 100, 100);

  if (remaining <= 0) {
    return (
      <div className="bg-gray-700 text-gray-200 p-4 rounded-2xl shadow">
        <div className="flex items-center gap-2 font-bold">
          <FaUsers />
          Group {group}
        </div>
        <p className="mt-2 text-sm text-red-300">
          Kuota penuh (18 peserta)
        </p>
      </div>
    );
  }

  function submit() {
    setError("");
    setSuccess(false);

    if (names.length !== count || names.some(n => !n.trim())) {
      setError("Nama peserta belum lengkap");
      return;
    }

    if (!phone.trim()) {
      setError("No WhatsApp PIC wajib diisi");
      return;
    }

    push(ref(db, "registrations"), {
      date,
      batch,
      group,
      count,
      pic_phone: phone,
      participants: names.map((n, i) => ({
        name: n,
        is_pic: i === 0,
      })),
      createdAt: Date.now(),
    });

    setSuccess(true);
    setNames([""]);
    setPhone("");
    setCount(1);
  }

  return (
    <div className="bg-white text-blue-950 p-5 rounded-2xl shadow-lg space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">
          Group {group}
        </div>
        <span className="text-sm font-semibold text-blue-700">
          {used}/{capacity}
        </span>
      </div>

      {/* PROGRESS */}
      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm font-semibold">
          Pendaftaran berhasil disimpan
        </div>
      )}

      {/* JUMLAH PESERTA */}
      <select
        value={count}
        onChange={e => {
          const v = Number(e.target.value);
          setCount(v);
          setNames(Array(v).fill(""));
        }}
        className="
          w-full p-3 rounded-xl border
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        {Array.from({ length: remaining }, (_, i) => i + 1).map(v => (
          <option key={v} value={v}>
            {v} Orang
          </option>
        ))}
      </select>

      {/* NAMA PESERTA */}
      <div className="space-y-2">
        {names.map((n, i) => (
          <input
            key={i}
            value={n}
            placeholder={i === 0 ? "Nama PIC" : `Nama Peserta ${i + 1}`}
            onChange={e => {
              const copy = [...names];
              copy[i] = e.target.value;
              setNames(copy);
            }}
            className="
              w-full p-3 rounded-xl border
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        ))}
      </div>

      {/* WA */}
      <input
        value={phone}
        placeholder="No WhatsApp PIC"
        onChange={e => setPhone(e.target.value)}
        className="
          w-full p-3 rounded-xl border
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      />

      {/* SUBMIT */}
      <button
        onClick={submit}
        className="
          w-full py-3 rounded-xl font-bold
          bg-blue-950 text-yellow-300
          hover:bg-blue-900 transition
        "
      >
        Simpan Pendaftaran
      </button>
    </div>
  );
}
