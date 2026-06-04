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

