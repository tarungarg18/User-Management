const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function makeHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function callApi(path, method = "GET", body = null, token = "") {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: makeHeaders(token),
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "request failed");
  }
  return data;
}
