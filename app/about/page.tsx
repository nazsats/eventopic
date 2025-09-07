"use client";

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";

export default function About() {
  return (
    <>
      <Navbar />
      {/* About Section: Updated with Company Desc & Services List */}
      <section className="py-20 bg-[var(--secondary)]">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading" 
            style={{ color: "var(--white)" }}
          >
            About Eventopic &ndash; Where Ideas Become Experiences
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center font-body"
            style={{ color: "var(--light)" }}
          >
            <p className="text-lg mb-8 leading-relaxed">
              Eventopic is a full-service event and staffing solutions company based in Dubai. With over 3 years of hands-on experience, we transform visions into reality through expert event management. From end-to-end planning and logistics to execution, we create seamless, memorable experiences for private individuals, corporations, and government entities.
            </p>
            <p className="text-lg italic mb-8">
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
                className="card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <h3 className="text-2xl font-semibold mb-4 font-heading" style={{ color: "var(--primary)" }}>{item.title}</h3>
                <p className="text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}>
        <div className="container mx-auto text-center px-4">
          <p>&copy; 2025 Eventopic. All rights reserved. | Expert Event Solutions in Dubai.</p>
        </div>
      </footer>
    </>
  );
}