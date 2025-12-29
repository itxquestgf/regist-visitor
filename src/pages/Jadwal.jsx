import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { FaWhatsapp, FaClock } from "react-icons/fa";
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

  const [dates, setDates] = useState([]);
  const [visits, setVisits] = useState({});

  /* =======================
     LOAD JADWAL MANUAL
  ======================= */
  useEffect(() => {
    const jadwalRef = ref(db, "jadwal");

    return onValue(jadwalRef, snap => {
      const val = snap.val() || {};
      setDates(Object.keys(val).sort());
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
    <div className="min-h-screen bg-blue-950 px-4 py-6 text-white relative">
      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <Logo />
      </div>

      {/* INFO ADMIN */}
      <div className="max-w-xl mx-auto bg-yellow-100 text-blue-950 p-4 rounded-2xl flex gap-3 shadow mb-8">
        <FaWhatsapp className="text-green-600 mt-1" size={28} />
        <div>
          <p className="font-bold">Butuh bantuan?</p>
          <p className="text-sm">
            Jika jadwal penuh atau batch tidak bisa dipilih,
            silakan hubungi admin.
          </p>
          <a
            href={`https://wa.me/${ADMIN_WA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 font-bold text-green-700 underline"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>
      </div>

      {/* JADWAL */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {dates.map(date => {
          const dayFull = isDayFull(date);

          return (
            <div
              key={date}
              className="bg-white text-blue-950 rounded-2xl p-5 shadow-lg space-y-4"
            >
              {/* DATE */}
              <div className="text-center">
                <h2 className="font-bold text-lg">{date}</h2>
                {dayFull && (
                  <span className="text-sm text-red-600 font-semibold">
                    PENUH
                  </span>
                )}
              </div>

              {/* BATCHES */}
              <div className="space-y-2">
                {BATCHES.map(b => {
                  const full = isBatchFull(date, b.id);

                  return (
                    <button
                      key={b.id}
                      disabled={full}
                      onClick={() =>
                        !full && navigate(`/batch/${date}/${b.id}`)
                      }
                      className={`
                        w-full p-3 rounded-xl border text-sm text-left
                        transition flex justify-between items-center
                        ${
                          full
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "hover:bg-blue-950 hover:text-yellow-300"
                        }
                      `}
                    >
                      <div>
                        <p className="font-bold">Batch {b.id}</p>
                        <p className="text-xs flex items-center gap-1">
                          <FaClock /> {b.time}
                        </p>
                      </div>
                      {full && (
                        <span className="text-xs font-bold text-red-600">
                          PENUH
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING WA */}
      <a
        href={`https://wa.me/${ADMIN_WA}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-6 right-6
          bg-green-500 hover:bg-green-600
          text-white p-4 rounded-full shadow-xl z-50
        "
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
}
