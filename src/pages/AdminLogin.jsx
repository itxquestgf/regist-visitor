import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const nav = useNavigate();

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav("/admin/dashboard");
    } catch {
      alert("Login gagal");
    }
  }

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 space-y-3">
        <h1 className="font-bold text-blue-950 text-center">
          Admin Login
        </h1>

        <input
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPass(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={login}
          className="w-full bg-blue-950 text-yellow-300 py-2 rounded font-bold"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
