import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const ADMIN_WA = "628131073719"; // GANTI NO ADMIN

/* =======================
   BATCH LIST
======================= */
const BATCHES = [
  { id: 1, time: "08.45 - 11.00" },
  { id: 2, time: "09.45 - 12.00" },
  { id: 3, time: "12.45 - 15.00" },
  { id: 4, time: "13.45 - 16.00" },
  { id: 5, time: "15.45 - 18.00" }
];

export default function Jadwal() {
  const navigate = useNavigate();

  const [dates, setDates] = useState([]);          // ← dari firebase jadwal
  const [visits, setVisits] = useState({});        // ← dari registrations

  /* =======================
     LOAD JADWAL MANUAL
  ======================= */
  useEffect(() => {
    const jadwalRef = ref(db, "jadwal");

    return onValue(jadwalRef, snap => {
      const val = snap.val() || {};
      const list = Object.keys(val).sort(); // sort tanggal
      setDates(list);
    });
  }, []);

  /* =======================
     LOAD REGISTRATIONS
  ======================= */
  useEffect(() => {
    const visitsRef = ref(db, "registrations");

    return onValue(visitsRef, snapshot => {
      setVisits(snapshot.val() || {});
    });
  }, []);

  /* =======================
     CEK BATCH FULL
  ======================= */
  function isBatchFull(date, batchId) {
    let count = 0;

    Object.values(visits).forEach(d => {
      if (d.date === date && d.batch === batchId) {
        count += Number(d.count || 0);
      }
    });

    return count >= 18;
  }

  /* =======================
     CEK HARI FULL
  ======================= */
  function isDayFull(date) {
    return BATCHES.every(b => isBatchFull(date, b.id));
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white space-y-6 relative">
      <div className="flex justify-center">
        <Logo />
      </div>

      {/* INFO ADMIN */}
      <div className="bg-yellow-100 text-blue-950 p-4 rounded-xl flex items-start gap-3">
        <FaWhatsapp className="text-green-600 mt-1" size={28} />
        <div>
          <p className="font-bold">Butuh bantuan atau informasi?</p>
          <p className="text-sm">
            Jika jadwal penuh atau batch tidak bisa dipilih,
            silakan hubungi admin.
          </p>
          <a
            href={`https://wa.me/${ADMIN_WA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-green-700 font-bold underline"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>
      </div>

      {/* JADWAL */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dates.map(date => {
          const dayFull = isDayFull(date);

          return (
            <div
              key={date}
              className="bg-white text-blue-950 rounded-xl p-4 space-y-3"
            >
              <h2 className="font-bold text-lg text-center">
                {date}
                {dayFull && (
                  <span className="block text-sm text-red-600">
                    (PENUH)
                  </span>
                )}
              </h2>

              {BATCHES.map(b => {
                const full = isBatchFull(date, b.id);

                return (
                  <button
                    key={b.id}
                    disabled={full}
                    onClick={() =>
                      !full && navigate(`/batch/${date}/${b.id}`)
                    }
                    className={`w-full border rounded-lg p-2 text-sm mb-1 transition
                      ${
                        full
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "hover:bg-blue-950 hover:text-yellow-300"
                      }`}
                  >
                    Batch {b.id}
                    <br />
                    <span className="text-xs">{b.time}</span>
                    {full && " — PENUH"}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* FLOATING WA */}
      <a
        href={`https://wa.me/${ADMIN_WA}`}
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
