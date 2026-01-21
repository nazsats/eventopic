"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  FaHeadset,
  FaLaptopCode,
  FaBolt,
  FaCheck,
  FaUsers
} from "react-icons/fa";
import Link from "next/link";

export default function Services() {
  const roles = [
    "Stand Speaker", "MC / Anchor", "Hostess", "VIP Hostess", "Promoter",
    "Sales Promoter", "Brand Ambassador", "Model", "Promotional Model",
    "Fashion Model", "Influencer", "Content Creator", "Photographer",
    "Videographer", "Reels Creator", "Dancer", "Singer", "DJ", "Musician",
    "Flash Mob Artist", "Live Artist", "Greeter", "Usher", "Receptionist",
    "Registration Staff", "Sampling Staff", "Lead Generator",
    "Event Coordinator", "Team Leader", "Event Manager", "Security Staff", "Bouncer"
  ];

  const process = [
    {
      step: "01",
      title: "Create Profile",
      desc: "Join our platform and showcase your skills to top brands instantly.",
      icon: <FaLaptopCode />,
    },
    {
      step: "02",
      title: "Get Matched",
      desc: "Our intelligent software pairs you with the perfect opportunities.",
      icon: <FaBolt />,
    },
    {
      step: "03",
      title: "Get Hired",
      desc: "Receive offers, accept jobs, and start working without the hassle.",
      icon: <FaCheck />,
    },
    {
      step: "04",
      title: "Get Paid",
      desc: "Secure and timely payments directly through our platform.",
      icon: <FaHeadset />,
    },
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 min-h-[60vh] flex items-center justify-center bg-[var(--background)] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display gradient-text">
              Staffing Solutions
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed text-[var(--text-secondary)] font-light">
              We provide 24/7 support and a massive database of skilled professionals for every event need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Roles Grid */}
      <section className="py-20 bg-[var(--background)] relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-display mb-6">We Have All Types of <span className="gradient-text">Skilled Workers</span></h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              From front-of-house to technical support, we connect you with the best talent in the industry.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 rounded-full glass-card hover:border-[var(--primary)] cursor-default transition-all"
              >
                <span className="text-[var(--text-primary)] font-medium">{role}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work - Software Platform Focus */}
      <section className="py-20 bg-[var(--surface)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-display gradient-text"
          >
            How We Work
          </motion.h2>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xl text-[var(--text-secondary)]">
              We are a cutting-edge software platform designed to make hiring smooth, fast, and efficient.
              Our technology removes the bottlenecks of traditional agencies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-3xl text-[var(--primary)] group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-[var(--primary)]/20">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 font-display text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-base font-light text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display gradient-text">
              Need Support?
            </h2>
            <p className="text-xl mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto font-light">
              We provide 24/7 support to everyone regarding any doubts, jobs, or event requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-10 py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:shadow-[var(--primary)]/30"
              >
                Contact Us
              </motion.a>
              <motion.a
                href="/portal/applications"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--primary)]"
              >
                <FaUsers />
                Join Community
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}