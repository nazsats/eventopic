"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Services() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16" 
            style={{ color: "var(--primary)" }}
          >
            Our Services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { title: "Promoters and Staff", desc: "We provide experienced promoters and staff for all types of events to ensure smooth operations." },
              { title: "Event Planning Services", desc: "Full-service planning for marriages, parties, birthday celebrations, tech events, and more." },
              { title: "Volunteers", desc: "Supplying dedicated volunteers for private and government events." },
              { title: "Job Opportunities", desc: "Offering short-term works and part-time jobs in the event management sector." },
            ].map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-[var(--white)] rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>{service.title}</h3>
                <p className="text-lg">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ backgroundColor: "var(--dark)", color: "var(--white)" }}>
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Eventopic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}