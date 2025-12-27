import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const BATCHES = [
  { id: 1, time: "08.45 - 11.00" },
  { id: 2, time: "09.45 - 12.00" },
  { id: 3, time: "12.45 - 15.00" },
  { id: 4, time: "13.45 - 16.00" },
  { id: 5, time: "15.45 - 18.00" }
];

// helper bikin 6 hari ke depan
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

  return (
    <div className="min-h-screen bg-blue-950 p-6 text-white space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dates.map(date => (
          <div
            key={date}
            className="bg-white text-blue-950 rounded-xl p-4 space-y-3"
          >
            <h2 className="font-bold text-lg text-center">{date}</h2>

            {BATCHES.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/batch/${date}/${b.id}`)}
                className="w-full border border-blue-950 rounded-lg p-2 text-sm hover:bg-blue-950 hover:text-yellow-300 transition"
              >
                Batch {b.id} <br />
                <span className="text-xs">{b.time}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
