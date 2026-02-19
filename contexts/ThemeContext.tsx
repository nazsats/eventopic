"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
    | "dark-luxury"
    | "midnight-ocean"
    | "aurora-forest"
    | "sunset-rose"
    | "royal-purple"
    | "golden-dusk";

export interface Theme {
    id: ThemeId;
    name: string;
    emoji: string;
    description: string;
    preview: {
        background: string;
        primary: string;
        accent: string;
    };
}

export const themes: Theme[] = [
    {
        id: "dark-luxury",
        name: "Dark Luxury",
        emoji: "⚡",
        description: "Electric cyber vibes",
        preview: {
            background: "#0A0A0F",
            primary: "#00D4FF",
            accent: "#FFB800",
        },
    },
    {
        id: "midnight-ocean",
        name: "Midnight Ocean",
        emoji: "🌊",
        description: "Deep sea blues",
        preview: {
            background: "#020B18",
            primary: "#0EA5E9",
            accent: "#38BDF8",
        },
    },
    {
        id: "aurora-forest",
        name: "Aurora Forest",
        emoji: "🌿",
        description: "Lush emerald tones",
        preview: {
            background: "#020F0A",
            primary: "#10B981",
            accent: "#34D399",
        },
    },
    {
        id: "sunset-rose",
        name: "Sunset Rose",
        emoji: "🌸",
        description: "Warm rosy glow",
        preview: {
            background: "#0F080C",
            primary: "#F43F5E",
            accent: "#FB7185",
        },
    },
    {
        id: "royal-purple",
        name: "Royal Purple",
        emoji: "👑",
        description: "Regal violet luxury",
        preview: {
            background: "#08050F",
            primary: "#A855F7",
            accent: "#C084FC",
        },
    },
    {
        id: "golden-dusk",
        name: "Golden Dusk",
        emoji: "✨",
        description: "Warm amber elegance",
        preview: {
            background: "#0F0A02",
            primary: "#F59E0B",
            accent: "#FBBF24",
        },
    },
];

interface ThemeContextType {
    currentTheme: ThemeId;
    setTheme: (id: ThemeId) => void;
    themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType>({
    currentTheme: "dark-luxury",
    setTheme: () => { },
    themes,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeId>("dark-luxury");

    useEffect(() => {
        const saved = localStorage.getItem("eventopic-theme") as ThemeId | null;
        if (saved && themes.find((t) => t.id === saved)) {
            setCurrentTheme(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
    }, []);

    const setTheme = (id: ThemeId) => {
        setCurrentTheme(id);
        document.documentElement.setAttribute("data-theme", id);
        localStorage.setItem("eventopic-theme", id);
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
