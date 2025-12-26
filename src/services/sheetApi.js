const API = import.meta.env.VITE_SHEET_API;

export async function fetchRegistrations() {
  const res = await fetch(API);
  return res.json();
}

export async function submitRegistration(payload) {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
