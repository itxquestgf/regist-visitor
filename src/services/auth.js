import { ref, get } from "firebase/database";
import { db } from "../firebase";

export async function login(pin) {
  const snap = await get(ref(db, `admins/${pin}`));
  if (snap.exists()) {
    localStorage.setItem("admin", "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem("admin");
}

export function isAdmin() {
  return localStorage.getItem("admin") === "true";
}
