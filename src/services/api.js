const BASE_URL = "https://cody-chronographic-tobi.ngrok-free.dev/api/visitor";

const HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true"
};

/* REGISTRATIONS */
export async function getRegistrations() {
  const res = await fetch(`${BASE_URL}/registrations`, { headers: HEADERS });
  return res.json();
}

export async function createRegistration(data) {
  const res = await fetch(`${BASE_URL}/registrations`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteRegistration(id) {
  await fetch(`${BASE_URL}/registrations/${id}`, { method: "DELETE", headers: HEADERS });
}

/* JADWAL */
export async function getJadwal() {
  const res = await fetch(`${BASE_URL}/jadwal`, { headers: HEADERS });
  return res.json();
}

export async function addJadwal(dateStr) {
  const res = await fetch(`${BASE_URL}/jadwal`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ id: dateStr, date: dateStr })
  });
  return res.json();
}

export async function deleteJadwal(dateStr) {
  await fetch(`${BASE_URL}/jadwal/${dateStr}`, { method: "DELETE", headers: HEADERS });
}
