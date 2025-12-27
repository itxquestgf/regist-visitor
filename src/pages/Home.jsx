import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center gap-6">
      <Logo />

      <button
        onClick={() => navigate("/jadwal")}
        className="bg-yellow-300 text-blue-950 px-6 py-3 rounded-xl font-bold text-lg"
      >
        Lanjutkan
      </button>
    </div>
  );
}
