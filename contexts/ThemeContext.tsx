"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "dubai-luxury" | "hospitality" | "expo" | "executive" | "desert";

export interface Theme {
  id: ThemeId;
  name: string;
  desc: string;
  swatches: { primary: string; accent: string; secondary: string; bg: string };
}

// Order matches the 5 luxury palettes. The first is the default (= :root in CSS).
export const themes: Theme[] = [
  { id: "dubai-luxury", name: "Dubai Luxury", desc: "Navy · Gold · Teal", swatches: { primary: "#0B132B", accent: "#C9A84C", secondary: "#00A896", bg: "#FAF8F4" } },
  { id: "hospitality", name: "Hospitality Premium", desc: "Navy · Gold", swatches: { primary: "#112D4E", accent: "#D4AF37", secondary: "#5B7BA3", bg: "#F8F6F2" } },
  { id: "expo", name: "Modern Expo", desc: "Blue · Teal · Gold", swatches: { primary: "#003566", accent: "#E9C46A", secondary: "#2A9D8F", bg: "#F7F9FC" } },
  { id: "executive", name: "Black & Gold", desc: "Black · Gold", swatches: { primary: "#111827", accent: "#C8A14D", secondary: "#6B7280", bg: "#F9F7F3" } },
  { id: "desert", name: "Desert Luxury", desc: "Brown · Sand · Emerald", swatches: { primary: "#3E2723", accent: "#D6B36A", secondary: "#2E8B57", bg: "#FCFAF5" } },
];

const DEFAULT: ThemeId = "dubai-luxury";

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
