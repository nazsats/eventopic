"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "cyprus";

export interface Theme {
  id: ThemeId;
  name: string;
  desc: string;
  swatches: { primary: string; accent: string; secondary: string; bg: string };
}

// Single brand palette (= :root in CSS): Cyprus + Sand Dune.
export const themes: Theme[] = [
  { id: "cyprus", name: "Cyprus", desc: "Cyprus · Sand Dune · Brass", swatches: { primary: "#004643", accent: "#B08D4A", secondary: "#2E7D74", bg: "#F0EDE5" } },
];

const DEFAULT: ThemeId = "cyprus";

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: DEFAULT,
  setTheme: () => { },
  themes,
});

function applyTheme(id: ThemeId) {
  // Default theme lives in :root (no attribute); others use [data-theme].
  if (id === DEFAULT) document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", id);
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(DEFAULT);

  useEffect(() => {
    const saved = localStorage.getItem("eventopic-theme") as ThemeId | null;
    if (saved && themes.find((t) => t.id === saved)) {
      setCurrentTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const setTheme = (id: ThemeId) => {
    setCurrentTheme(id);
    applyTheme(id);
    localStorage.setItem("eventopic-theme", id);
    // Let canvas visuals (globe) re-read CSS variables.
    window.dispatchEvent(new CustomEvent("themechange", { detail: id }));
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
