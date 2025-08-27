"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16" 
            style={{ color: "var(--primary)" }}
          >
            About Eventopic
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-[var(--white)] p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
            >
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>What We Do?</h3>
              <p className="text-lg">
                Eventopic transforms your vision into reality with expert event management in Dubai. From planning to execution, we create seamless, memorable experiences for all types of events.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-[var(--white)] p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
            >
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>What Are Our Services?</h3>
              <p className="text-lg">
                We offer promoters, staff, and volunteers for events, full-service planning for marriages, birthdays, parties, and tech events, plus short-term and part-time job opportunities.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-[var(--white)] p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
            >
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "var(--accent)" }}>Who We Work With?</h3>
              <p className="text-lg">
                We partner with private individuals, corporations, and government entities, delivering tailored solutions for events of all scales in Dubai and beyond.
              </p>
            </motion.div>
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