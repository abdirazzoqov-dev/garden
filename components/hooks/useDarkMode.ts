"use client";

import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("park_dark_mode");
    if (saved === "true") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    setIsDark((v) => {
      const next = !v;
      if (next) document.documentElement.classList.add("dark");
      else      document.documentElement.classList.remove("dark");
      localStorage.setItem("park_dark_mode", String(next));
      return next;
    });
  };

  return { isDark, toggle };
}
