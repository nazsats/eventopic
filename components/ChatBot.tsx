// components/ChatBot.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaComment,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Renders a minimal subset of markdown — bold, italic, links, bullet lists */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // Bullet list
    if (line.startsWith("- ") || line.startsWith("• ")) {
      result.push(
        <li key={lineIdx} className="ml-4 list-disc">
          {inlineMarkdown(line.slice(2))}
        </li>
      );
      return;
    }
    // Bold heading lines (e.g. **Title**)
    if (line.startsWith("## ") || line.startsWith("### ")) {
      result.push(
        <p key={lineIdx} className="font-bold text-white mt-2">
          {inlineMarkdown(line.replace(/^#{2,3} /, ""))}
        </p>
      );
      return;
    }
    // Empty line = paragraph break
    if (line.trim() === "") {
      result.push(<br key={lineIdx} />);
      return;
    }
    // Normal line
    result.push(<p key={lineIdx}>{inlineMarkdown(line)}</p>);
  });

  return result;
}

function inlineMarkdown(text: string): React.ReactNode {
  // bold
  const boldRegex = /\*\*(.*?)\*\*/g;
  // links [label](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;

  // split by bold or link patterns
  const combined = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // bold
      parts.push(<strong key={match.index} className="text-white font-semibold">{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      // link
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-[var(--primary)] hover:text-white transition-colors"
        >
          {match[2]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

// ─── Quick Reply Chips ────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "How many model jobs are available?",
  "Show me promoter jobs",
  "What jobs are in Dubai?",
  "I need staff for my event",
  "How do I apply for a job?",
];

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = React.memo(function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-xs shadow-md">
          <FaRobot />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${isBot
          ? "bg-[var(--surface-elevated)] text-[var(--text-secondary)] rounded-tl-sm"
          : "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white rounded-tr-sm"
          }`}
      >
        {isBot ? (
          <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
        ) : (
          <p>{msg.content}</p>
        )}
        <p className={`text-[10px] mt-1.5 ${isBot ? "text-[var(--text-muted)]" : "text-white/60"}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] text-xs">
          <FaUser />
        </div>
      )}
    </motion.div>
  );
});

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3 justify-start"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-xs shadow-md">
        <FaRobot />
      </div>
      <div className="bg-[var(--surface-elevated)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-md flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--primary)]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm **Eventopic AI Assistant**.\n\nI can help you with:\n- Finding & applying for jobs\n- Event staffing solutions\n- Payment & experience questions\n- Contacting our team\n\nWhat can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setShowQuickReplies(false);

    // Build conversation history for API (exclude welcome system-message-like content)
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const botMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again or contact us at **info@eventopic.com**.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "👋 Hi! I'm **Eventopic AI Assistant**.\n\nI can help you with:\n- Finding & applying for jobs\n- Event staffing solutions\n- Payment & experience questions\n- Contacting our team\n\nWhat can I help you with today?",
        timestamp: new Date(),
      },
    ]);
    setShowQuickReplies(true);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] transition-shadow"
            aria-label="Open AI Chat"
          >
            {/* Pulse ring */}
            <span className="absolute w-full h-full rounded-full bg-[var(--primary)]/30 animate-ping" />
            <FaComment size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(100vh-100px)] flex flex-col rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[var(--border)]"
            style={{ background: "var(--background)" }}
            ref={chatWindowRef}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[var(--surface)] to-[var(--surface-elevated)] border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-md">
                  <FaRobot size={16} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[var(--surface)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Eventopic AI</p>
                  <p className="text-[10px] text-[var(--primary)] mt-0.5 leading-none">● Online · Powered by GPT-4o</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-light)] hover:text-white transition-colors"
                  title="Clear conversation"
                >
                  <FaTrash size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-light)] hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <FaTimes size={15} />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>

              {/* Quick Replies */}
              <AnimatePresence>
                {showQuickReplies && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-wrap gap-2 pt-1"
                  >
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => sendMessage(qr)}
                        className="px-3 py-1.5 text-xs rounded-full border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all duration-200 font-medium"
                      >
                        {qr}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3">
              {error && (
                <p className="text-xs text-red-400 mb-2 text-center">{error}</p>
              )}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything…"
                  disabled={isLoading}
                  className="flex-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-[0_0_16px_rgba(0,212,255,0.4)] transition-shadow flex-shrink-0"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" size={14} />
                  ) : (
                    <FaPaperPlane size={13} />
                  )}
                </motion.button>
              </form>
              <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
                AI may make mistakes. Verify important info with our team.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}