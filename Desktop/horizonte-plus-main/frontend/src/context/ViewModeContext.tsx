import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi, User } from "../services/api";

const STORAGE_KEY_ADMIN_TOKEN = "hp_admin_token";
const STORAGE_KEY_IMPERSONATED = "hp_impersonated_user";

interface ViewModeContextType {
  isStudentView: boolean;
  impersonatedUser: User | null;
  impersonate: (userId: string) => Promise<void>;
  stopImpersonating: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restaurar desde sessionStorage al cargar
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_IMPERSONATED);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [originalToken, setOriginalToken] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY_ADMIN_TOKEN);
  });

  // Sincronizar con sessionStorage
  useEffect(() => {
    if (originalToken) {
      sessionStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, originalToken);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN);
    }
  }, [originalToken]);

  useEffect(() => {
    if (impersonatedUser) {
      sessionStorage.setItem(STORAGE_KEY_IMPERSONATED, JSON.stringify(impersonatedUser));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_IMPERSONATED);
    }
  }, [impersonatedUser]);

  const impersonate = useCallback(async (userId: string) => {
    const adminToken = localStorage.getItem("hp_token");
    if (!adminToken) return;

    const { accessToken, user } = await authApi.impersonate(userId);

    setOriginalToken(adminToken);
    setImpersonatedUser(user);
    localStorage.setItem("hp_token", accessToken);
  }, []);

  const stopImpersonating = useCallback(() => {
    if (originalToken) {
      localStorage.setItem("hp_token", originalToken);
    }
    setOriginalToken(null);
    setImpersonatedUser(null);
  }, [originalToken]);

  return (
    <ViewModeContext.Provider value={{
      isStudentView: !!impersonatedUser,
      impersonatedUser,
      impersonate,
      stopImpersonating,
    }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
};
