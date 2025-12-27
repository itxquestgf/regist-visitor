const BASE_URL = "http://localhost:3001/api/registrations";

export async function getAll() {
  const res = await fetch(BASE_URL);
  return res.json();
}

export async function create(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function removeById(id) {
  await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
}
