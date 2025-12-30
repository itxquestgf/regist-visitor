import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, push, onValue, off } from "firebase/database";
import { db } from "../firebase";
import { FaUsers, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-4 py-8 text-white">
      {/* HEADER */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-yellow-300/20 rounded-xl">
              <FaCalendarAlt className="text-yellow-300 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-yellow-300 mb-1">
                {date}
              </h1>
              <div className="flex items-center gap-2 text-blue-200">
                <FaClock className="text-sm" />
                <p className="text-base font-medium">
                  Batch {batch} • Pendaftaran Peserta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GROUP FORMS */}
      <div className="max-w-2xl mx-auto space-y-6">
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

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (remaining <= 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-gray-200 p-6 rounded-3xl shadow-2xl border border-gray-600/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gray-600/50 rounded-xl">
            <FaUsers className="text-xl text-gray-300" />
          </div>
          <h3 className="text-xl font-bold">Group {group}</h3>
        </div>
        <div className="flex items-center gap-2 text-red-300 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
          <FaExclamationCircle />
          <p className="font-semibold">Kuota penuh (18 peserta)</p>
        </div>
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
    <div className="bg-white text-blue-950 p-6 rounded-3xl shadow-2xl border border-blue-100 space-y-5 transform transition-all hover:shadow-3xl">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-3 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaUsers className="text-white text-lg" />
          </div>
          <h3 className="font-bold text-xl text-blue-950">Group {group}</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
          <span className="text-sm font-bold text-blue-700">
            {used}/{capacity}
          </span>
          <span className="text-xs text-blue-500 font-medium">
            {remaining} tersedia
          </span>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-blue-600">
          <span>Kuota Terisi</span>
          <span>{Math.round(percent)}%</span>
        </div>
        <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full shadow-sm"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
          <FaExclamationCircle className="text-red-500 text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
          <FaCheckCircle className="text-green-500 text-lg shrink-0" />
          <span>Pendaftaran berhasil disimpan</span>
        </div>
      )}

      {/* JUMLAH PESERTA */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Jumlah Peserta
        </label>
        <select
          value={count}
          onChange={e => {
            const v = Number(e.target.value);
            setCount(v);
            setNames(Array(v).fill(""));
          }}
          className="
            w-full p-4 rounded-xl border-2 border-blue-200
            bg-white text-blue-950 font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all cursor-pointer
            hover:border-blue-300
          "
        >
          {Array.from({ length: remaining }, (_, i) => i + 1).map(v => (
            <option key={v} value={v}>
              {v} Orang
            </option>
          ))}
        </select>
      </div>

      {/* NAMA PESERTA */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Data Peserta
        </label>
        {names.map((n, i) => (
          <div key={i} className="relative">
            <input
              value={n}
              placeholder={i === 0 ? "Nama PIC (Pemimpin)" : `Nama Peserta ${i + 1}`}
              onChange={e => {
                const copy = [...names];
                copy[i] = e.target.value;
                setNames(copy);
              }}
              className="
                w-full p-4 rounded-xl border-2 border-blue-200
                bg-white text-blue-950 placeholder-blue-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all
                hover:border-blue-300
              "
            />
            {i === 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                PIC
              </span>
            )}
          </div>
        ))}
      </div>

      {/* WA */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          No WhatsApp PIC <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          placeholder="Contoh: 081234567890"
          onChange={e => setPhone(e.target.value)}
          className="
            w-full p-4 rounded-xl border-2 border-blue-200
            bg-white text-blue-950 placeholder-blue-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all
            hover:border-blue-300
          "
        />
      </div>

      {/* SUBMIT */}
      <button
        onClick={submit}
        className="
          w-full py-4 rounded-xl font-bold text-lg
          bg-gradient-to-r from-blue-950 to-blue-900 text-yellow-300
          hover:from-blue-900 hover:to-blue-800
          active:scale-[0.98]
          transition-all duration-200 shadow-lg hover:shadow-xl
          border-2 border-yellow-300/20
        "
      >
        Simpan Pendaftaran
      </button>
    </div>
  );
}
