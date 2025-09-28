
"use client";

import Navbar from "../../components/Navbar";
import { motion, Variants } from "framer-motion";
import { FaBullhorn, FaUsers, FaTools, FaHandshake, FaChartLine, FaBullseye, FaBuilding, FaSearch } from "react-icons/fa";
import Footer from "../../components/Footer";

export default function Services() {
  const services = [
    { title: "Event Management", desc: "End-to-end planning, logistics, and execution for weddings, birthdays, corporate tech events, and more in Dubai.", icon: <FaBullhorn /> },
    { title: "Event Staffing", desc: "Professional hosts, hostesses, ushers, coordinators, security, and backstage crew to ensure smooth operations.", icon: <FaUsers /> },
    { title: "Labour Support", desc: "Reliable set-up crews, technical teams, and runners for efficient event setup and management.", icon: <FaTools /> },
    { title: "Promoters & Brand Ambassadors", desc: "Short-term or part-time hiring for product/service promotion at events.", icon: <FaHandshake /> },
    { title: "Sponsorship Solutions", desc: "Finding and managing sponsors to enhance your event's reach and funding.", icon: <FaChartLine /> },
    { title: "Marketing Services", desc: "Pre-event buzz through digital campaigns, on-ground activations, and content creation (photos/videos).", icon: <FaBullseye /> },
    { title: "Corporate Support", desc: "HR solutions for temporary staffing needs, plus vendor management for sound, light, and décor.", icon: <FaBuilding /> },
    { title: "Job Opportunities", desc: "Part-time and short-term roles in event management – join our team as promoters, volunteers, or staff.", icon: <FaSearch /> },
  ];

  const containerVariants: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring" as const, stiffness: 100 } },
  };

  return (
    <>
      <Navbar />
      <section className="py-24 relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Our Services
          </motion.h1>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                className="card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border max-w-sm mx-auto bg-[var(--primary)]/80 backdrop-blur-sm relative overflow-hidden group"
                style={{ borderColor: "var(--light)/30" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex justify-center items-center h-16 w-16 mx-auto mb-6 relative z-10">
                  <div className="text-5xl text-[var(--color-accent)]">{service.icon}</div>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4 font-heading text-center text-[var(--text-accent)] relative z-10">
                  {service.title}
                </h3>
                <p className="text-lg leading-relaxed font-body text-center text-[var(--text-body)] relative z-10">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}