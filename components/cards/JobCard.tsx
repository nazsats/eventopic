// components/cards/JobCard.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaBriefcase, FaClock, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
    duration: string;
    rate: number;
    category: string;
  };
  index?: number;
}

const categoryGradients: { [key: string]: string } = {
  'Event Staffing': 'from-purple-500 to-indigo-500',
  'Brand Ambassador': 'from-pink-500 to-rose-500',
  'Modeling': 'from-blue-500 to-cyan-500',
  'Hospitality': 'from-green-500 to-emerald-500',
  'Entertainment': 'from-yellow-500 to-orange-500',
  'Corporate': 'from-indigo-500 to-purple-500',
  'default': 'from-purple-500 to-pink-500'
};

export function JobCard({ job, index = 0 }: JobCardProps) {
  const router = useRouter();
  const gradient = categoryGradients[job.category] || categoryGradients['default'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}>
            <FaBriefcase className="text-base sm:text-lg" />
          </div>
          
          {/* Title & Category */}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
              {job.category}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {job.title}
            </h3>
          </div>
        </div>

        {/* Rate Badge */}
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
          <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
            AED {job.rate}/hr
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FaMapMarkerAlt className="text-purple-500 flex-shrink-0 text-sm" />
          <span className="text-sm font-medium truncate">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FaClock className="text-blue-500 flex-shrink-0 text-sm" />
          <span className="text-sm font-medium truncate">{job.type} · {job.duration}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
        <button className="w-full py-2 sm:py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          View Details
        </button>
      </div>
    </motion.div>
  );
}
