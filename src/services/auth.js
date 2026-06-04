export function logout() {
  localStorage.removeItem("admin_pin");
}

export function isAdmin() {
  return localStorage.getItem("admin_pin") === "logged_in";
}
