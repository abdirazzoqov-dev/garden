"use client";

// ============================================================
// PARK CENTRAL — Multi-user Authentication Hook
// ============================================================

import { useState, useCallback, createContext, useContext } from "react";
import type { AuthUser, ActiveTab, EmployeeRole } from "../types";
import { ROLE_ACCESS } from "../types";
import { INITIAL_EMPLOYEES, INITIAL_STALLS } from "../constants";

// ── Context ───────────────────────────────────────────────────
export interface AuthContextValue {
  user:         AuthUser | null;
  isLoading:    boolean;
  loginError:   string;
  login:        (username: string, password: string) => boolean;
  logout:       () => void;
  canAccess:    (tab: ActiveTab) => boolean;
  allowedTabs:  ActiveTab[];
  defaultTab:   ActiveTab;
}

import { createContext as _createContext } from "react";

export const AuthContext = _createContext<AuthContextValue>({
  user:        null,
  isLoading:   false,
  loginError:  "",
  login:       () => false,
  logout:      () => {},
  canAccess:   () => false,
  allowedTabs: [],
  defaultTab:  "pos",
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

// ── Provider logic (used in AuthProvider component) ───────────
export function useAuthState() {
  const [user,       setUser]       = useState<AuthUser | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [loginError, setLoginError] = useState("");

  const login = useCallback((username: string, password: string): boolean => {
    setIsLoading(true);
    setLoginError("");

    // Find matching employee
    const emp = INITIAL_EMPLOYEES.find(
      (e) =>
        e.username.toLowerCase() === username.trim().toLowerCase() &&
        e.password === password
    );

    if (!emp) {
      setLoginError("Login yoki parol noto'g'ri");
      setIsLoading(false);
      return false;
    }

    // Resolve stall name
    const stallName = emp.stallId
      ? INITIAL_STALLS.find((s) => s.id === emp.stallId)?.name
      : undefined;

    const authUser: AuthUser = {
      id:        emp.id,
      name:      emp.name,
      role:      emp.role,
      username:  emp.username,
      stallId:   emp.stallId,
      stallName,
      avatar:    emp.name.charAt(0).toUpperCase(),
    };

    setUser(authUser);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setLoginError("");
  }, []);

  const canAccess = useCallback(
    (tab: ActiveTab): boolean => {
      if (!user) return false;
      const access = ROLE_ACCESS[user.role];
      return access.allowedTabs.includes(tab);
    },
    [user]
  );

  const allowedTabs: ActiveTab[] = user
    ? ROLE_ACCESS[user.role].allowedTabs
    : [];

  const defaultTab: ActiveTab = user
    ? ROLE_ACCESS[user.role].defaultTab
    : "pos";

  return {
    user,
    isLoading,
    loginError,
    login,
    logout,
    canAccess,
    allowedTabs,
    defaultTab,
  };
}
