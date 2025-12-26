export default function DateSelector({ date }) {
  return (
    <div className="bg-blue-950 text-white p-5 rounded-xl shadow">
      <p className="text-sm text-yellow-300 uppercase tracking-wide">
        Tanggal Kunjungan
      </p>
      <p className="text-2xl font-bold mt-1">{date}</p>
    </div>
  );
}
