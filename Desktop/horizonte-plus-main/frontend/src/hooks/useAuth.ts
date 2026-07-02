import { useState, useEffect, useCallback } from "react";
import { authApi, User } from "../services/api";

let globalUser: User | null = null;
let globalToken: string | null = localStorage.getItem("hp_token");
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useAuth() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await authApi.login(email, password);
    localStorage.setItem("hp_token", accessToken);
    globalToken = accessToken;
    globalUser = await authApi.me();
    notify();
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const { accessToken } = await authApi.register(data);
    localStorage.setItem("hp_token", accessToken);
    globalToken = accessToken;
    globalUser = await authApi.me();
    notify();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hp_token");
    globalToken = null;
    globalUser = null;
    notify();
  }, []);

  const fetchMe = useCallback(async () => {
    if (!globalToken) return;
    try {
      globalUser = await authApi.me();
      notify();
    } catch {
      logout();
    }
  }, [logout]);

  return {
    user: globalUser,
    token: globalToken,
    isLoggedIn: !!globalToken && !!globalUser,
    login,
    register,
    logout,
    fetchMe,
  };
}
