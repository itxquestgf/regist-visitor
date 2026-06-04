import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRegistrations, createRegistration } from "../services/api";
import { FaUsers, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function BatchForm() {
  const { date, batch } = useParams();
  const [used, setUsed] = useState({ 1: 0, 2: 0, 3: 0 });

  async function loadData() {
    try {
      const all = await getRegistrations();
      const arr = Array.isArray(all) ? all : [];
      
      const temp = { 1: 0, 2: 0, 3: 0 };
      arr.forEach(d => {
        if (d.date === date && d.batch === Number(batch)) {
          temp[d.group] += d.count;
        }
      });
      setUsed(temp);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
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
            refresh={loadData}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   GROUP FORM
========================= */
function GroupForm({ date, batch, group, used, refresh }) {
  const capacity = 18;
  const remaining = capacity - used;

  const [count, setCount] = useState(1);
  const [picName, setPicName] = useState("");
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

  const isFull = remaining <= 0;
  const { currentUser } = useAuth(); // Ambil user saat ini

  async function submit() {
    setError("");
    setSuccess(false);

    if (!picName.trim()) {
      setError("Nama PIC (Pemimpin) wajib diisi");
      return;
    }

    if (!phone.trim()) {
      setError("No WhatsApp PIC wajib diisi");
      return;
    }

    try {
      await createRegistration({
        date,
        batch: Number(batch),
        group,
        count,
        pic_phone: phone,
        pic_email: currentUser?.email || "Tidak ada email", // Menyertakan email
        participants: Array.from({ length: count }).map((_, i) => ({
          name: i === 0 ? picName : `Anggota ${i}`,
          is_pic: i === 0,
        })),
        createdAt: Date.now(),
      });
      
      setSuccess(true);
      setPicName("");
      setPhone("");
      setCount(1);
      refresh();
    } catch (e) {
      setError("Gagal menyimpan data: " + e.message);
    }

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
          <span className={`text-xs font-medium ${isFull ? 'text-red-500 font-bold' : 'text-blue-500'}`}>
            {isFull ? 'PENUH' : `${remaining} tersedia`}
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

      {/* FULL MESSAGE ATAU ERROR MESSAGE */}
      {isFull ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
          <FaExclamationCircle className="text-red-500 text-lg shrink-0" />
          <span>Kuota grup ini telah penuh (18/18 peserta)</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
          <FaExclamationCircle className="text-red-500 text-lg shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
          <FaCheckCircle className="text-green-500 text-lg shrink-0" />
          <span>Pendaftaran berhasil disimpan</span>
        </div>
      )}

      {/* JUMLAH PESERTA */}
      {!isFull && (
        <>
          <div className="space-y-2">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Jumlah Peserta
        </label>
        <select
          disabled={isFull}
          value={count}
          onChange={e => {
            setCount(Number(e.target.value));
          }}
          className={`
            w-full p-4 rounded-xl border-2 border-blue-200
            bg-white text-blue-950 font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all cursor-pointer
            ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-300'}
          `}
        >
          {isFull ? (
            <option value="1">0 Orang</option>
          ) : (
            Array.from({ length: remaining }, (_, i) => i + 1).map(v => (
              <option key={v} value={v}>
                {v} Orang
              </option>
            ))
          )}
        </select>
      </div>

      {/* NAMA PIC */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Nama Lengkap PIC (Pemimpin)
        </label>
        <div className="relative">
          <input
            disabled={isFull}
            value={picName}
            placeholder={isFull ? "-" : "Masukkan nama ketua rombongan"}
            onChange={e => setPicName(e.target.value)}
            className={`
              w-full p-4 rounded-xl border-2 border-blue-200
              bg-white text-blue-950 placeholder-blue-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all
              ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-300'}
            `}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
            PIC
          </span>
        </div>
      </div>

      {/* WA */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          No WhatsApp PIC <span className="text-red-500">*</span>
        </label>
        <input
          disabled={isFull}
          type="tel"
          value={phone}
          placeholder={isFull ? "-" : "Contoh: 081234567890"}
          onChange={e => setPhone(e.target.value)}
          className={`
            w-full p-4 rounded-xl border-2 border-blue-200
            bg-white text-blue-950 placeholder-blue-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all
            ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-300'}
          `}
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
        </>
      )}
    </div>
  );
}
