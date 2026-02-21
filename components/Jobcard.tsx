// components/JobCard.tsx

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaBriefcase, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaArrowRight, FaStar, FaFire } from "react-icons/fa";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
    duration: string;
    rate: number;
    category: string;
    description?: string;
  };
  index?: number;
}

export default function JobCard({ job, index = 0 }: JobCardProps) {
  const router = useRouter();

  const categoryColors: { [key: string]: { bg: string; text: string } } = {
    'Event Staffing': { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400' },
    'Brand Ambassador': { bg: 'from-pink-500/20 to-rose-500/20', text: 'text-pink-400' },
    'Modeling': { bg: 'from-purple-500/20 to-violet-500/20', text: 'text-purple-400' },
    'Hospitality': { bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400' },
    'Entertainment': { bg: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400' },
    'Corporate': { bg: 'from-indigo-500/20 to-purple-500/20', text: 'text-indigo-400' },
    'default': { bg: 'from-[var(--primary)]/20 to-[var(--secondary)]/20', text: 'text-[var(--primary)]' }
  };

  const colors = categoryColors[job.category] || categoryColors['default'];

  return (
    <motion.div
      role="listitem"
      aria-label={`Job: ${job.title}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="glass-card p-6 lg:p-8 group cursor-pointer relative overflow-hidden h-full"
    >
      {/* Background Effects - Behind everything */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10`}></div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-24 p-[1px] bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="w-full h-full rounded-[23px] bg-transparent"></div>
      </div>

      {/* Content Container - Always on top */}
      <div className="relative z-20">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Job Icon */}
            <div className="job-card-icon group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <FaBriefcase />
            </div>
            
            {/* Category Badge */}
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.bg} border border-[var(--border)] backdrop-blur-sm`}>
              <span className={`text-xs font-bold ${colors.text}`}>
                {job.category}
              </span>
            </div>
          </div>

          {/* Featured Badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/20 border border-[var(--accent)]/30 rounded-full backdrop-blur-sm">
            <FaFire className="text-[var(--accent)] text-xs" />
            <span className="text-xs font-bold text-[var(--accent)]">Hot</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="job-card-title group-hover:gradient-text transition-all duration-300 mb-4">
          {job.title}
        </h3>

        {/* Job Details */}
        <div className="space-y-3 mb-6">
          <div className="job-card-meta">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-light)]/50 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
              <FaMapMarkerAlt className="text-[var(--primary)] text-sm" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Location</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{job.location}</div>
            </div>
          </div>

          <div className="job-card-meta">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-light)]/50 flex items-center justify-center group-hover:bg-[var(--secondary)]/20 transition-colors">
              <FaClock className="text-[var(--secondary)] text-sm" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Duration</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{job.type} • {job.duration}</div>
            </div>
          </div>

          <div className="job-card-meta">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/30 flex items-center justify-center">
              <FaMoneyBillWave className="text-[var(--accent)] text-sm" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wide">Hourly Rate</div>
              <div className="text-lg font-black gradient-text-accent">
                AED {job.rate}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* CTA Button */}
        <div className="pt-4 border-t border-[var(--border)] group-hover:border-[var(--border-hover)] transition-colors">
          <div className="flex items-center justify-between px-4 py-3 rounded-16 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--border)] group-hover:border-[var(--border-hover)] group-hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
            <span className="font-bold text-sm lg:text-base text-[var(--text-primary)]">View Details</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">Apply Now</span>
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[var(--primary)]/30 group-hover:scale-110 transition-all duration-300">
                <FaArrowRight className="text-sm text-[var(--primary)] group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="text-[var(--accent)] text-xs" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {Math.floor(Math.random() * 40 + 60)}% Match
            </span>
          </div>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-24">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </motion.div>
  );
}
