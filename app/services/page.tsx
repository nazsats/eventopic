// Updated services/page.tsx (Note: Path should be app/services/page.tsx for consistency)
// Changes: Updated color theme integration.

"use client";

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";

export default function Services() {
  const services = [
    { title: "Event Management", desc: "End-to-end planning, logistics, and execution for weddings, birthdays, corporate tech events, and more in Dubai." },
    { title: "Event Staffing", desc: "Professional hosts, hostesses, ushers, coordinators, security, and backstage crew to ensure smooth operations." },
    { title: "Labour Support", desc: "Reliable set-up crews, technical teams, and runners for efficient event setup and management." },
    { title: "Promoters & Brand Ambassadors", desc: "Short-term or part-time hiring for product/service promotion at events." },
    { title: "Sponsorship Solutions", desc: "Finding and managing sponsors to enhance your event's reach and funding." },
    { title: "Marketing Services", desc: "Pre-event buzz through digital campaigns, on-ground activations, and content creation (photos/videos)." },
    { title: "Corporate Support", desc: "HR solutions for temporary staffing needs, plus vendor management for sound, light, and décor." },
    { title: "Job Opportunities", desc: "Part-time and short-term roles in event management – join our team as promoters, volunteers, or staff." },
  ];

  return (
    <>
      <Navbar />
      {/* Services Section: Grid for Responsiveness */}
      <section className="py-20 bg-[var(--secondary)]">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading" 
            style={{ color: "var(--white)" }}
          >
            Our Services – Comprehensive Event Solutions in Dubai
          </motion.h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow text-center"
              >
                <h3 className="text-xl font-semibold mb-4 font-heading" style={{ color: "var(--accent)" }}>{service.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--light)" }}>{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
        <div className="container mx-auto text-center px-4">
          <p>&copy; 2025 Eventopic. All rights reserved. | Tailored Event Services for Dubai.</p>
        </div>
      </footer>
    </>
  );
}