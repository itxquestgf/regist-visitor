export default function BatchCard({ batch, used, capacity, onSelect }) {
  const full = used >= capacity;

  return (
    <div
      className={`rounded-xl border p-5 transition
        ${full
          ? "bg-slate-200 text-slate-400 border-slate-300"
          : "bg-white border-blue-200 hover:shadow-lg"}
      `}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-blue-700">
          Batch {batch.id}
        </h3>
        <span className="text-sm font-semibold text-yellow-500">
          {batch.time}
        </span>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full bg-slate-200 rounded">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${(used / capacity) * 100}%` }}
          />
        </div>
        <p className="text-sm mt-1">
          Terisi <b>{used}</b> / {capacity}
        </p>
      </div>

      {full ? (
        <p className="mt-4 text-red-500 font-semibold">PENUH</p>
      ) : (
        <button
          onClick={onSelect}
          className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500
                     text-blue-900 font-bold py-2 rounded-lg"
        >
          Pilih Batch
        </button>
      )}
    </div>
  );
}
