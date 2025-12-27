import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const KEY = "admin_pin_auth";

export async function login(pin) {
  const ref = doc(db, "admins", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  if (snap.data().pin === pin) {
    localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function isAdmin() {
  return localStorage.getItem(KEY) === "true";
}
