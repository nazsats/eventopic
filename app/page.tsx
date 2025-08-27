"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function Home() {
  // Sample gallery images (replace with your actual image paths in public/gallery/)
  const galleryImages = [
    "/gallery/event1.png",
    "/gallery/event2.png",
    "/gallery/event3.png",
    "/gallery/event4.png",
    "/gallery/event5.png",
    "/gallery/event6.png",
  ];

  // Animation variants for hero text
  const textVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.8, 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      } 
    },
  };

  // Button animation with slide-in
  const buttonVariants: Variants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: direction,
    }),
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.6, 
        type: "spring", 
        stiffness: 80 
      } 
    },
    hover: { 
      scale: 1.1, 
      transition: { duration: 0.3 } 
    },
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="py-32 relative overflow-hidden" style={{ background: "linear-gradient(to bottom, var(--accent), var(--primary))", color: "var(--white)" }}>
        <div className="absolute inset-0 opacity-20 hero-bg">
          <Image
            src="/gallery/burjkhalifa.png"
            alt="Burj Khalifa Background"
            fill
            style={{ objectFit: "cover" }}
            quality={50}
            priority
          />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <motion.h2 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg"
          >
            Eventopic
          </motion.h2>
          <motion.p 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl mb-10 drop-shadow-md"
          >
            The Future of Showcasing Your Events
          </motion.p>
          <motion.div 
            className="flex justify-center space-x-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.div 
              variants={buttonVariants} 
              custom={-100} 
              whileHover="hover"
            >
              <Link 
                href="/contact" 
                className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" 
                style={{ backgroundColor: "var(--light)", color: "var(--dark)" }}
              >
                Enquiry
              </Link>
            </motion.div>
            <motion.div 
              variants={buttonVariants} 
              custom={100} 
              whileHover="hover"
            >
              <Link 
                href="/contact#staff-form" 
                className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" 
                style={{ backgroundColor: "var(--white)", color: "var(--accent)" }}
              >
                Join Our Team
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16" 
            style={{ color: "var(--primary)" }}
          >
            Event Gallery
          </motion.h2>
          <div className="gallery-grid">
            {galleryImages.map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 80 }}
                viewport={{ once: true }}
                className="gallery-item"
              >
                <Image src={src} alt={`Event ${index + 1}`} width={300} height={200} className="rounded-xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20" style={{ background: "linear-gradient(to right, var(--light), var(--secondary))" }}>
        <div className="container mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12" 
            style={{ color: "var(--primary)" }}
          >
            About Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl max-w-3xl mx-auto mb-10"
          >
            Eventopic is an experienced team with over 3 years of hands-on experience in Dubai. We have handled numerous events, providing top-notch services to make every occasion memorable.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            viewport={{ once: true }}
          >
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all" 
              style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}
            >
              Learn More
            </Link>
          </motion.div>
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