// components/Footer.tsx

import Link from "next/link";
import {
  FaInstagram,
  FaFacebookF,
  FaEnvelope,
  FaLinkedin,
  FaHeart,
  FaRocket,
  FaMapMarkerAlt,
  FaPhone,
  FaArrowUp,
  FaGem,
  FaStar
} from "react-icons/fa";
import { motion } from "framer-motion";

const socialLinks = [
  {
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/eventopic-staffing-b037b6383",
    icon: <FaLinkedin />,
    label: "LinkedIn",
    color: "hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-400"
  },
  {
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/eventopic_staffing",
    icon: <FaInstagram />,
    label: "Instagram",
    color: "hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-400"
  },
  {
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/share/1C7GsbB6Zr/",
    icon: <FaFacebookF />,
    label: "Facebook",
    color: "hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-400"
  },
  {
    href: "mailto:info@eventopic.com",
    icon: <FaEnvelope />,
    label: "Email",
    color: "hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] hover:border-[var(--primary)]"
  },
];

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/portal", label: "Find Jobs" },
  { href: "/contact", label: "Contact" },
  { href: "/gallery", label: "Gallery" },
];

const categories = [
  'Event Staff',
  'Brand Ambassadors',
  'Models',
  'Hospitality',
  'Entertainment'
];

const features = [
  'Premium Staffing',
  'Event Management',
  'Professional Training',
  'Quality Assurance'
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden bg-[var(--background)] border-t border-[var(--border)]">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-xl">
                  <FaRocket className="text-2xl text-white" />
                </div>
                <span className="font-display text-3xl font-bold gradient-text">Eventopic</span>
              </div>

              <p className="text-[var(--text-secondary)] text-base mb-6 leading-relaxed">
                Dubai&apos;s premier event management and staffing platform, connecting talented professionals with luxury opportunities across the region.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                    <FaMapMarkerAlt className="text-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--text-secondary)]">Dubai, UAE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                    <FaPhone className="text-[var(--secondary)]" />
                  </div>
                  <span className="text-[var(--text-secondary)]">+971 XX XXX XXXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center">
                    <FaEnvelope className="text-[var(--accent)]" />
                  </div>
                  <span className="text-[var(--text-secondary)]">info@eventopic.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map(({ href, icon, label, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center transition-all duration-300 ${color}`}
                    aria-label={`Visit Eventopic on ${label}`}
                  >
                    <span className="text-xl">{icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-heading text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <FaGem className="text-[var(--primary)]" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all duration-300 flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-heading text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <FaStar className="text-[var(--secondary)]" />
              Categories
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href="/portal"
                    className="group text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-all duration-300 flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{cat}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-heading text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <FaEnvelope className="text-[var(--accent)]" />
              Stay Updated
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
              Get the latest job opportunities and event industry insights delivered to your inbox.
            </p>

            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="modern-input"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary"
              >
                Subscribe to Updates
              </motion.button>
            </form>

            <p className="text-[var(--text-muted)] text-xs mt-3">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>

            {/* Features List */}
            <div className="mt-6 space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <div className="w-1 h-1 rounded-full bg-[var(--primary)]"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-8"></div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-[var(--text-muted)] text-sm text-center md:text-left">
            &copy; 2025 Eventopic. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <span>Crafted with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <FaHeart className="text-red-400" />
            </motion.div>
            <span>in Dubai, UAE</span>
          </div>

          <div className="flex gap-6 text-sm text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-[var(--text-primary)] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-[var(--primary)]/50 transition-all duration-300 z-[90] group"
        aria-label="Scroll to top"
      >
        <FaArrowUp className="text-xl group-hover:-translate-y-1 transition-transform duration-300" />
      </motion.button>
    </footer>
  );
}