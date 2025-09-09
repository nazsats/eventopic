// Updated app/about/page.tsx
// Enhancements: Improved card styling with gradient borders and better shadows. Enhanced typography hierarchy. Added subtle hover effects with color transitions using existing palette (gold/teal accents on primary/secondary backgrounds).

"use client";

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";

export default function About() {
  return (
    <>
      <Navbar />
      {/* About Section: Enhanced with gradient overlays and improved spacing */}
      <section className="py-20 bg-[var(--secondary)] relative overflow-hidden">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading relative" 
            style={{ color: "var(--white)", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            About Eventopic &ndash; Where Ideas Become Experiences
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center font-body relative"
            style={{ color: "var(--light)" }}
          >
            <p className="text-lg mb-8 leading-relaxed px-4">
              Eventopic is a full-service event and staffing solutions company based in Dubai. With over 3 years of hands-on experience, we transform visions into reality through expert event management. From end-to-end planning and logistics to execution, we create seamless, memorable experiences for private individuals, corporations, and government entities.
            </p>
            <p className="text-lg italic mb-8 px-4 border-l-4 border-[var(--color-accent)] pl-4">
              &quot;Your Event. Our People. Perfect Execution.&quot; &ndash; Staffing Moments, Creating Memories.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                title: "What We Do", 
                desc: "End-to-end event management: Planning, logistics, and execution for all types of events in Dubai. We handle everything from concept to completion, ensuring flawless operations." 
              },
              { 
                title: "Our Services", 
                desc: "Event staffing (hosts, hostesses, ushers, coordinators, security); Labour support (set-up crews, technical teams); Promoters &amp; brand ambassadors; Sponsorship solutions; Marketing services (pre-event buzz, digital campaigns); Corporate HR support; Content creation (photos/videos); Vendor management (sound, light, décor)." 
              },
              { 
                title: "Who We Work With", 
                desc: "Private individuals for weddings and birthdays; Corporations for tech events and activations; Government entities for large-scale gatherings. Tailored solutions for events of all scales in Dubai and beyond." 
              },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-[var(--accent)]/20 bg-[var(--primary)]/50 backdrop-blur-sm"
              >
                <h3 className="text-2xl font-semibold mb-4 font-heading relative" style={{ color: "var(--color-accent)" }}>
                  {item.title}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--teal-accent)]/20 to-[var(--color-accent)]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--light)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer: Enhanced with gradient border */}
      <footer className="py-10 relative" style={{ backgroundColor: "var(--primary)", color: "var(--white)", borderTop: "1px solid var(--color-accent)" }}>
        <div className="container mx-auto text-center px-4">
          <p className="text-lg font-medium">&copy; 2025 Eventopic. All rights reserved. | Expert Event Solutions in Dubai.</p>
        </div>
      </footer>
    </>
  );
}