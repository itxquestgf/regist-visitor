const BASE_URL = "http://localhost:4000";

/* REGISTRATIONS */
export async function getRegistrations() {
  const res = await fetch(`${BASE_URL}/registrations`);
  return res.json();
}

export async function createRegistration(data) {
  const res = await fetch(`${BASE_URL}/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteRegistration(id) {
  await fetch(`${BASE_URL}/registrations/${id}`, { method: "DELETE" });
}

/* JADWAL */
export async function getJadwal() {
  const res = await fetch(`${BASE_URL}/jadwal`);
  return res.json();
}

export async function addJadwal(dateStr) {
  const res = await fetch(`${BASE_URL}/jadwal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: dateStr, date: dateStr })
  });
  return res.json();
}

export async function deleteJadwal(dateStr) {
  await fetch(`${BASE_URL}/jadwal/${dateStr}`, { method: "DELETE" });
}
