// components/JobCard.tsx
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
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  return (
    <motion.div
      role="listitem"
      aria-label={`Job: ${job.title}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      onClick={() => router.push(`/portal/applications/${job.id}`)}
      className="card p-6 rounded-2xl shadow-xl border border-[var(--light)]/20 bg-[var(--secondary)] backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      <h3 className="text-xl font-semibold mb-3 font-heading flex items-center gap-2 text-[var(--text-accent)]">
        <FaBriefcase className="text-[var(--text-accent)]" /> {job.title}
      </h3>
      <p className="mb-2 flex items-center gap-2 text-sm font-body text-[var(--text-body)]">
        <FaMapMarkerAlt className="text-[var(--text-accent)]" /> {job.location}
      </p>
      <p className="mb-2 flex items-center gap-2 text-sm font-body text-[var(--text-body)]">
        <FaClock className="text-[var(--text-accent)]" /> {job.type} - {job.duration}
      </p>
      <p className="mb-4 flex items-center gap-2 text-sm font-body text-[var(--text-body)]">
        <FaMoneyBillWave className="text-[var(--text-accent)]" /> AED {job.rate}/hour
      </p>
      <p className="text-sm italic font-body text-[var(--text-accent)] bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] bg-clip-text text-transparent">
        Click to view details
      </p>
    </motion.div>
  );
}
