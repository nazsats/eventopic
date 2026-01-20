// components/cards/FeatureCard.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, gradient = "from-purple-500 to-pink-500", index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="text-center group"
    >
      {/* Icon Container */}
      <div className="relative inline-block mb-4 sm:mb-6">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <span className="text-2xl sm:text-3xl">{icon}</span>
        </div>
        
        {/* Decorative circle */}
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
      </div>

      {/* Content */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
        {description}
      </p>
    </motion.div>
  );
}