// components/cards/StatCard.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  number: string;
  label: string;
  gradient?: string;
  index?: number;
}

export function StatCard({ icon, number, label, gradient = "from-purple-500 to-pink-500", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 text-center"
    >
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} text-white mb-3 sm:mb-4 shadow-md`}>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>

      {/* Number */}
      <div className={`text-3xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {number}
      </div>

      {/* Label */}
      <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </div>
    </motion.div>
  );
}