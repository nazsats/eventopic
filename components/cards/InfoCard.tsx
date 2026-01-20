// components/cards/InfoCard.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'gradient' | 'bordered';
  className?: string;
  index?: number;
}

export function InfoCard({ 
  title, 
  description, 
  children, 
  icon, 
  variant = 'default',
  className = '',
  index = 0 
}: InfoCardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800',
    bordered: 'bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ${variants[variant]} ${className}`}
    >
      {/* Header */}
      {(icon || title) && (
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
              <span className="text-lg sm:text-xl">{icon}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {children && (
        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {children}
        </div>
      )}
    </motion.div>
  );
}