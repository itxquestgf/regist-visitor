import { useEffect, useState } from "react";
import { getLogs } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaArrowLeft, FaCalendarDay, FaUser, FaInfoCircle, FaTrash, FaPlusCircle } from "react-icons/fa";

export default function AdminLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("admin_pin") !== "logged_in") {
      navigate("/admin");
    }
  }, [navigate]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await getLogs();
      if (Array.isArray(data)) {
        // Sort by newest first
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(data);
      }
    } catch (e) {
      console.error("Gagal mengambil log", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 p-4 sm:p-8 text-white relative">
      <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
        <button 
          onClick={() => navigate("/admin/dashboard")}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-300 flex items-center gap-3">
          <FaHistory /> Log Aktivitas Pendaftaran
        </h1>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-blue-300 animate-pulse font-bold text-lg">
            Memuat data log...
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center border border-white/20 shadow-2xl">
            <FaHistory className="text-6xl text-blue-400/50 mx-auto mb-4" />
            <p className="text-xl font-bold text-blue-200 mb-2">Belum ada aktivitas yang dicatat.</p>
          </div>
        ) : (
          <div className="bg-white text-blue-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-blue-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-blue-900 text-sm uppercase tracking-wider">
                    <th className="p-4 font-black">Waktu</th>
                    <th className="p-4 font-black">Aktor</th>
                    <th className="p-4 font-black">Aksi</th>
                    <th className="p-4 font-black">Target</th>
                    <th className="p-4 font-black">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log, i) => (
                    <tr key={log.id || i} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="p-4 font-bold text-sm">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-500" />
                          {log.actor}
                        </div>
                      </td>
                      <td className="p-4">
                        {log.action === "CREATE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <FaPlusCircle /> TERTAMBAH
                          </span>
                        ) : log.action === "DELETE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <FaTrash /> TERHAPUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                            <FaInfoCircle /> {log.action}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-semibold text-blue-800 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaCalendarDay className="text-blue-400" />
                          {log.target}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700 min-w-[250px]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
