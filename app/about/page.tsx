// Updated app/about/page.tsx
// Enhancements: Improved card styling with gradient borders and better shadows. Enhanced typography hierarchy. Added subtle hover effects with color transitions using existing palette (gold/teal accents on primary/secondary backgrounds).

"use client";

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { FaInfoCircle } from "react-icons/fa";
import Footer from "../../components/Footer";

export default function About() {
  return (
    <>
      <Navbar />
      <section className="py-24 bg-[var(--secondary)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-5xl md:text-6xl font-bold text-center mb-16 font-heading text-[var(--text-accent)] text-shadow"
            aria-label="About Eventopic"
          >
            About Eventopic 
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center font-body text-[var(--text-body)]"
          >
            <p className="text-lg md:text-xl mb-8 leading-relaxed px-4">
              Eventopic is a full-service event and staffing solutions company based in Dubai. With over 3 years of hands-on experience, we transform visions into reality through expert event management. From end-to-end planning and logistics to execution, we create seamless, memorable experiences for private individuals, corporations, and government entities.
            </p>
            <p className="text-lg md:text-xl italic mb-8 px-4 border-l-4 border-[var(--color-accent)] pl-4 text-[var(--text-accent)]">
              &quot;Your Event. Our People. Perfect Execution.&quot; &ndash; Staffing Moments, Creating Memories.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "What We Do",
                desc: "End-to-end event management: Planning, logistics, and execution for all types of events in Dubai. We handle everything from concept to completion, ensuring flawless operations.",
              },
              {
                title: "Our Services",
                desc: "Event staffing (hosts, hostesses, ushers, coordinators, security); Labour support (set-up crews, technical teams); Promoters &amp; brand ambassadors; Sponsorship solutions; Marketing services (pre-event buzz, digital campaigns); Corporate HR support; Content creation (photos/videos); Vendor management (sound, light, décor).",
              },
              {
                title: "Who We Work With",
                desc: "Private individuals for weddings and birthdays; Corporations for tech events and activations; Government entities for large-scale gatherings. Tailored solutions for events of all scales in Dubai and beyond.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, type: "spring" }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm group animate-pulse"
                role="article"
                aria-label={item.title}
              >
                <h3 className="text-2xl font-semibold mb-4 font-heading text-[var(--text-accent)] relative">
                  <FaInfoCircle className="inline mr-2 text-[var(--color-accent)]" /> {item.title}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </h3>
                <p className="text-base leading-relaxed text-[var(--text-body)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
