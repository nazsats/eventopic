//app/terms/page.tsx

"use client"; // Ensure client-side rendering to avoid SSR issues

import Navbar from "../../components/Navbar";
import { motion } from "framer-motion"; // Ensure named import

export default function Terms() {
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
            Terms and Conditions
          </h1>
          <p className="text-lg" style={{ color: "var(--light)" }}>
            This is a placeholder for Eventopic&apos;s Terms and Conditions. Add your full terms here.
          </p>
        </motion.div>
      </section>
    </>
  );
}