import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [email, setEmail] = useState(() => localStorage.getItem("email"));

  async function login(loginEmail, password) {
    const data = await api.login(loginEmail, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    setToken(data.token);
    setEmail(data.email);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ token, email, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
