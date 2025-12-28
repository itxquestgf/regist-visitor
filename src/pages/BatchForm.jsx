import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, push, onValue } from "firebase/database";
import { db } from "../firebase";
import { FaWhatsapp } from "react-icons/fa";

const ADMIN_WA = "628131073719"; // GANTI NO ADMIN

export default function BatchForm() {
  const { date, batch } = useParams();
  const [used, setUsed] = useState({ 1: 0, 2: 0, 3: 0 });

  function loadUsed() {
    const visitsRef = ref(db, "registrations");
    onValue(visitsRef, snapshot => {
      const all = snapshot.val() || {};
      const temp = { 1: 0, 2: 0, 3: 0 };
      Object.values(all).forEach(d => {
        if (d.date === date && d.batch === Number(batch)) temp[d.group] += d.count;
      });
      setUsed(temp);
    });
  }

  useEffect(() => {
    loadUsed();
  }, []);

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white space-y-6 relative">
      <h1 className="text-xl font-bold">
        {date} — Batch {batch}
      </h1>

      <div className="bg-yellow-100 text-blue-950 p-4 rounded-xl flex items-start gap-3">
        <FaWhatsapp className="text-green-600 mt-1" size={28} />
        <div>
          <p className="font-bold">Mengalami kendala pendaftaran?</p>
          <p className="text-sm">
            Jika data tidak tersimpan, kuota tidak sesuai, atau ada error,
            silakan hubungi admin melalui WhatsApp.
          </p>
          <a
            href={`https://wa.me/${ADMIN_WA}?text=Halo%20Admin,%20saya%20mengalami%20kendala%20pendaftaran%20pada%20tanggal%20${date}%20batch%20${batch}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-green-700 font-bold underline"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>
      </div>

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

      <a
        href={`https://wa.me/${ADMIN_WA}?text=Halo%20Admin,%20saya%20butuh%20bantuan%20pendaftaran%20tanggal%20${date}%20batch%20${batch}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600
                   text-white p-4 rounded-full shadow-lg z-50"
      >
        <FaWhatsapp size={28} />
      </a>
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
        Group {group} — <b>PENUH</b>
      </div>
    );
  }

  async function submit() {
    if (names.length !== count || names.some(n => !n)) {
      alert("Nama peserta belum lengkap");
      return;
    }
    if (!phone) {
      alert("No WhatsApp PIC wajib diisi");
      return;
    }

    const visitsRef = ref(db, "registrations");
    const newVisit = {
      date,
      batch,
      group,
      count,
      pic_phone: phone,
      participants: names.map((n, i) => ({ name: n, is_pic: i === 0 })),
      createdAt: Date.now(),
    };

    push(visitsRef, newVisit);
    alert("Pendaftaran berhasil");
    reload();
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
