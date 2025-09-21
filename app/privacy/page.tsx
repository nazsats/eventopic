//app/privacy/page.tsx

"use client";

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <>
      <Navbar />
      <section className="py-20 bg-[var(--secondary)] min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 max-w-2xl text-center"
        >
          <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--white)" }}>
            Privacy Policy
          </h1>
          <p className="text-lg" style={{ color: "var(--light)" }}>
            This is a placeholder for Eventopic&apos;s Privacy Policy. Add your full policy here.
          </p>
        </motion.div>
      </section>
    </>
  );
}