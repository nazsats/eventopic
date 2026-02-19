"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, themes, ThemeId } from "../contexts/ThemeContext";

export default function ThemeSwitcher() {
    const { currentTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const active = themes.find((t) => t.id === currentTheme)!;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: ThemeId) => {
        setTheme(id);
        setIsOpen(false);
    };

    return (
        <div className="relative" style={{ zIndex: 9999 }}>
            {/* Trigger button */}
            <motion.button
                ref={buttonRef}
                id="theme-switcher-btn"
                aria-label="Change theme"
                onClick={() => setIsOpen((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-elevated)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
            >
                <span style={{ fontSize: "1rem" }}>{active.emoji}</span>
                <span className="hidden sm:inline">{active.name}</span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                    }}
                >
                    <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </motion.button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            top: "calc(100% + 10px)",
                            right: 0,
                            minWidth: "260px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "20px",
                            padding: "16px",
                            boxShadow: "var(--shadow-lg)",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                marginBottom: "12px",
                                paddingLeft: "4px",
                                fontFamily: "var(--font-heading)",
                            }}
                        >
                            🎨 Choose Theme
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {themes.map((theme) => {
                                const isActive = theme.id === currentTheme;
                                return (
                                    <motion.button
                                        key={theme.id}
                                        onClick={() => handleSelect(theme.id)}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 12px",
                                            borderRadius: "12px",
                                            border: isActive
                                                ? "1px solid var(--primary)"
                                                : "1px solid transparent",
                                            background: isActive
                                                ? "var(--primary-muted)"
                                                : "transparent",
                                            cursor: "pointer",
                                            width: "100%",
                                            textAlign: "left",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-elevated)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                            }
                                        }}
                                    >
                                        {/* Color dots preview */}
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "3px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "22px",
                                                    height: "22px",
                                                    borderRadius: "50%",
                                                    background: theme.preview.background,
                                                    border: "2px solid rgba(255,255,255,0.15)",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: "22px",
                                                    height: "22px",
                                                    borderRadius: "50%",
                                                    background: theme.preview.primary,
                                                    marginLeft: "-8px",
                                                    border: "2px solid rgba(255,255,255,0.15)",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: "22px",
                                                    height: "22px",
                                                    borderRadius: "50%",
                                                    background: theme.preview.accent,
                                                    marginLeft: "-8px",
                                                    border: "2px solid rgba(255,255,255,0.15)",
                                                }}
                                            />
                                        </div>

                                        {/* Text */}
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontFamily: "var(--font-heading)",
                                                    fontWeight: 600,
                                                    fontSize: "0.875rem",
                                                    color: isActive ? "var(--primary)" : "var(--text-primary)",
                                                    marginBottom: "2px",
                                                }}
                                            >
                                                {theme.emoji} {theme.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {theme.description}
                                            </div>
                                        </div>

                                        {/* Active check */}
                                        {isActive && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    borderRadius: "50%",
                                                    background: "var(--primary)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <path
                                                        d="M2 5l2.5 2.5L8 3"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
