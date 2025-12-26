import { useEffect, useState } from "react";
import { fetchRegistrations, submitRegistration } from "../services/sheetApi";
import {
  BATCHES,
  BATCH_CAPACITY,
  PERSON_PER_GROUP,
  findNextAvailableDate,
  calculateBatchUsage,
} from "../services/capacity";
import BatchCard from "../Components/BatchCard";
import DateSelector from "../Components/DateSelector";

export default function Register() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState("");
  const [usage, setUsage] = useState({});
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [picName, setPicName] = useState("");
  const [picPhone, setPicPhone] = useState("");

  const [people, setPeople] = useState(1);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchRegistrations().then(res => {
      setData(res);
      setDate(findNextAvailableDate(res));
    });
  }, []);

  useEffect(() => {
    if (date) setUsage(calculateBatchUsage(data, date));
  }, [date, data]);

  // 🔑 Generate input sesuai jumlah orang
  useEffect(() => {
    setMembers(Array.from({ length: people }, (_, i) => members[i] || ""));
  }, [people]);

  function updateMember(index, value) {
    const copy = [...members];
    copy[index] = value;
    setMembers(copy);
  }

  async function handleSubmit() {
    if (!picName || !picPhone || !selectedBatch) {
      alert("Lengkapi data PIC");
      return;
    }

    if (members.some(m => !m)) {
      alert("Semua nama anggota wajib diisi");
      return;
    }

    const used = usage[selectedBatch] || 0;
    const remaining = BATCH_CAPACITY - used;

    if (people > remaining) {
      alert("Slot batch tidak mencukupi");
      return;
    }

    const startIndex = used + 1;
    const endIndex = used + people;

    const groupStart = Math.ceil(startIndex / PERSON_PER_GROUP);
    const groupEnd = Math.ceil(endIndex / PERSON_PER_GROUP);

    await submitRegistration({
      date,
      batch: selectedBatch,
      group_start: groupStart,
      group_end: groupEnd,
      people_count: people,
      pic_name: picName,
      pic_phone: picPhone,
      members: JSON.stringify(members),
    });

    alert("Pendaftaran berhasil");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-blue-950 text-white py-6 shadow">
        <h1 className="text-center text-2xl font-extrabold">
          PENDAFTARAN KUNJUNGAN
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <DateSelector date={date} />

        <div className="grid md:grid-cols-2 gap-5 mt-6">
          {BATCHES.map(b => (
            <BatchCard
              key={b.id}
              batch={b}
              used={usage[b.id] || 0}
              capacity={BATCH_CAPACITY}
              onSelect={() => setSelectedBatch(b.id)}
            />
          ))}
        </div>

        {selectedBatch && (
          <div className="mt-8 bg-white border border-blue-950 p-6 rounded-xl shadow">
            <h2 className="font-bold text-blue-950 mb-4">
              Form Rombongan – Batch {selectedBatch}
            </h2>

            <input
              placeholder="Nama PIC"
              className="w-full border p-2 rounded mb-3"
              onChange={e => setPicName(e.target.value)}
            />

            <input
              placeholder="No HP PIC"
              className="w-full border p-2 rounded mb-3"
              onChange={e => setPicPhone(e.target.value)}
            />

            <select
              className="w-full border p-2 rounded mb-4"
              value={people}
              onChange={e => setPeople(Number(e.target.value))}
            >
              {[...Array(54)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} orang
                </option>
              ))}
            </select>

            <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto mb-4">
              {members.map((m, i) => (
                <input
                  key={i}
                  placeholder={`Nama Anggota ${i + 1}`}
                  className="border p-2 rounded"
                  value={m}
                  onChange={e => updateMember(i, e.target.value)}
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-950 hover:bg-blue-900
                         text-white font-bold py-2 rounded-lg"
            >
              Simpan Pendaftaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
