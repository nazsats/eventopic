// Updated app/services/page.tsx
// Enhancements: Service cards with icons and gradient hovers. Better grid with even spacing.

"use client";

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { FaBullhorn, FaUsers, FaTools, FaHandshake, FaChartLine, FaBullseye, FaBuilding, FaSearch } from "react-icons/fa";

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

  return (
    <>
      <Navbar />
      {/* Services Section: Enhanced grid with icons */}
      <section className="py-20 bg-[var(--secondary)] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading relative" 
            style={{ color: "var(--white)", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            Our Services – Comprehensive Event Solutions in Dubai
          </motion.h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3 } }}
                className="card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-center border border-[var(--accent)]/20 bg-[var(--primary)]/50 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-4xl mb-4 mx-auto" style={{ color: "var(--color-accent)" }}>{service.icon}</div>
                <h3 className="text-xl font-semibold mb-4 font-heading relative z-10" style={{ color: "var(--white)" }}>{service.title}</h3>
                <p className="text-base leading-relaxed relative z-10" style={{ color: "var(--light)" }}>{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 relative" style={{ backgroundColor: "var(--primary)", color: "var(--white)", borderTop: "1px solid var(--color-accent)" }}>
        <div className="container mx-auto text-center px-4">
          <p className="text-lg font-medium">&copy; 2025 Eventopic. All rights reserved. | Tailored Event Services for Dubai.</p>
        </div>
      </footer>
    </>
  );
}