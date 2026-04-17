import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { callApi } from "../api/client";

const AuthContext = createContext(null);

const keyName = "purple_merit_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(keyName);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setToken(data.token || "");
        setUser(data.user || null);
      } catch {
        localStorage.removeItem(keyName);
      }
    }
    setLoading(false);
  }, []);

  function saveSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(keyName, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  function clearSession() {
    setToken("");
    setUser(null);
    localStorage.removeItem(keyName);
  }

  async function loginNow(email, password) {
    const data = await callApi("/auth/login", "POST", { email, password });
    saveSession(data.token, data.user);
  }

  async function refreshMyData() {
    if (!token) return;
    const me = await callApi("/users/me", "GET", null, token);
    saveSession(token, {
      id: me.id,
      name: me.name,
      email: me.email,
      role: me.role,
      status: me.status,
      createdAt: me.createdAt,
      updatedAt: me.updatedAt
    });
  }

  const value = useMemo(
    () => ({ token, user, loading, loginNow, clearSession, refreshMyData }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
