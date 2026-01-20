// components/cards/CategoryBadge.tsx
"use client";

import { motion } from "framer-motion";

interface CategoryBadgeProps {
  label: string;
  index?: number;
  onClick?: () => void;
}

export function CategoryBadge({ label, index = 0, onClick }: CategoryBadgeProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-300"
    >
      {label}
    </motion.button>
  );
}