import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const ADMIN_WA = "628131073719"; // GANTI NO ADMIN

const BATCHES = [
  { id: 1, time: "08.45 - 11.00" },
  { id: 2, time: "09.45 - 12.00" },
  { id: 3, time: "12.45 - 15.00" },
  { id: 4, time: "13.45 - 16.00" },
  { id: 5, time: "15.45 - 18.00" }
];

function getDates(count = 6) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function Jadwal() {
  const navigate = useNavigate();
  const dates = getDates(6);
  const [visits, setVisits] = useState({});

  useEffect(() => {
    const visitsRef = ref(db, "registrations");
    onValue(visitsRef, snapshot => {
      setVisits(snapshot.val() || {});
    });
  }, []);

  function isBatchFull(date, batchId) {
    let count = 0;
    Object.values(visits).forEach(d => {
      if (d.date === date && d.batch === batchId) count += d.count;
    });
    return count >= 18;
  }

  function isDayFull(date) {
    return BATCHES.every(b => isBatchFull(date, b.id));
  }

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white space-y-6 relative">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="bg-yellow-100 text-blue-950 p-4 rounded-xl flex items-start gap-3">
        <FaWhatsapp className="text-green-600 mt-1" size={28} />
        <div>
          <p className="font-bold">Butuh bantuan atau informasi?</p>
          <p className="text-sm">
            Jika jadwal penuh, batch tidak bisa dipilih, atau ada kendala lainnya,
            silakan hubungi admin melalui WhatsApp.
          </p>
          <a
            href={`https://wa.me/${ADMIN_WA}?text=Halo%20Admin,%20saya%20ingin%20bertanya%20terkait%20jadwal%20kunjungan`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-green-700 font-bold underline"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dates.map(date => (
          <div
            key={date}
            className="bg-white text-blue-950 rounded-xl p-4 space-y-3"
          >
            <h2 className="font-bold text-lg text-center">{date}</h2>

            {BATCHES.map(b => {
              const full = isBatchFull(date, b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => !full && navigate(`/batch/${date}/${b.id}`)}
                  className={`w-full border rounded-lg p-2 text-sm mb-1 transition ${
                    full
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "hover:bg-blue-950 hover:text-yellow-300"
                  }`}
                >
                  Batch {b.id} <br />
                  <span className="text-xs">{b.time}</span>
                  {full && " — PENUH"}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <a
        href={`https://wa.me/${ADMIN_WA}?text=Halo%20Admin,%20saya%20ingin%20bertanya%20terkait%20jadwal%20kunjungan`}
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
