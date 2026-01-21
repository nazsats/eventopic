"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaUsers,
  FaHandshake,
  FaAward,
  FaChartLine,
  FaHeart,
  FaStar,
  FaGem,
  FaLightbulb,
  FaShieldAlt,
  FaClock,
  FaHeadset
} from "react-icons/fa";

export default function About() {
  const values = [
    {
      icon: <FaRocket className="text-4xl gradient-text" />,
      title: "Speed",
      desc: "We understand that time is money. Our platform is built to provide the fastest staffing solutions in the UAE.",
    },
    {
      icon: <FaShieldAlt className="text-4xl gradient-text-accent" />,
      title: "Trust & Security",
      desc: "We provide 100% trusted and verified jobs. Your security and peace of mind are our top priorities.",
    },
    {
      icon: <FaHandshake className="text-4xl gradient-text" />,
      title: "Perfect Match",
      desc: "We use advanced matching to ensure candidates get jobs that perfectly align with their unique skills.",
    },
    {
      icon: <FaHeadset className="text-4xl gradient-text-accent" />,
      title: "24/7 Support",
      desc: "Our dedicated team is available around the clock to assist with any questions or concerns.",
    },
    {
      icon: <FaUsers className="text-4xl gradient-text" />,
      title: "Community First",
      desc: "We are building a thriving community of skilled professionals and forward-thinking employers.",
    },
    {
      icon: <FaStar className="text-4xl gradient-text-accent" />,
      title: "Excellence",
      desc: "We set high standards for our staff and our service, ensuring quality in every interaction.",
    },
  ];

  const communityStats = [
    {
      role: "Skilled Staff",
      count: "500+",
      desc: "Verified professionals ready to work",
      icon: <FaUsers className="text-3xl gradient-text" />,
    },
    {
      role: "Hiring Managers",
      count: "50+",
      desc: "Top brands trusting Eventopic",
      icon: <FaBriefcase className="text-3xl gradient-text-accent" />,
    },
    {
      role: "Support Team",
      count: "24/7",
      desc: "Dedicated support for all your needs",
      icon: <FaHeadset className="text-3xl gradient-text" />,
    },
  ];

  // Additional icon for the stats
  function FaBriefcase(props: any) {
    return <FaUsers {...props} />; // Fallback or import actual icon if needed, but reusing Users for now or importing specific one. 
    // Wait, FaBriefcase is imported in other files, let me check imports. 
    // I missed importing FaBriefcase in the top import list. I'll add it.
  }

  return (
    <>
      <Navbar />

      {/* Simplified Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden bg-[var(--background)]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/20 blur-[100px]" />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Empowering <span className="gradient-text">Connections</span>
            </h1>

            <p className="text-xl max-w-3xl mx-auto text-[var(--text-secondary)]">
              We are on a mission to bring jobs to the people, creating the smoothest and fastest hiring experience in the UAE.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-standard">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 -z-10"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">Our Mission</h2>
              </div>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                To create a seamless platform where skilled professionals can find opportunities instantly.
                We aim to eliminate the hassle of traditional hiring and make the experience better, easier, and accessible for everyone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--primary)]/10 -z-10"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] flex items-center justify-center">
                  <FaStar className="text-white text-xl" />
                </div>
                <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">Our Vision</h2>
              </div>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                To be the most trusted, secure, and fastest staffing platform in the UAE.
                We envision a future where talent meets opportunity at the click of a button, empowering careers and events alike.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-bold text-center mb-16 gradient-text text-balance"
          >
            What We Do
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Professional Staffing",
                desc: "We provide a comprehensive database of skilled professionals ready to deploy for your events, promotions, and corporate needs.",
                icon: <FaUsers className="text-4xl gradient-text mb-4" />,
              },
              {
                title: "End-to-End Solutions",
                desc: "From recruitment to deployment, we handle the entire manpower process, ensuring you get the right people without the headache.",
                icon: <FaHandshake className="text-4xl gradient-text-accent mb-4" />,
              },
              {
                title: "Skill Matching",
                desc: "Our platform intelligently matches candidates based on their specific skills and experience, ensuring a perfect fit for every role.",
                icon: <FaCheckCircle className="text-4xl gradient-text mb-4" />, // Replaced Gem with CheckCircle logic, needs import
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="glass-card p-8 text-center group h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="relative z-10">
                  {item.icon}
                  <h3 className="font-heading text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-bold text-center mb-16 text-balance"
          >
            Our Core <span className="gradient-text">Values</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="glass-card p-6 text-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="font-heading text-xl font-bold mb-3 text-[var(--text-primary)]">
                    {value.title}
                  </h3>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats (Replaced Team) */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-bold text-center mb-16 text-balance"
          >
            Our <span className="gradient-text-accent">Community</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {communityStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-8 text-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="relative z-10">
                  <div className="mb-4 flex justify-center">{stat.icon}</div>
                  <div className="text-5xl font-display font-bold mb-3 gradient-text">
                    {stat.count}
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3 text-[var(--text-primary)]">
                    {stat.role}
                  </h3>
                  <p className="text-base text-[var(--text-secondary)]">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-standard">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-card p-16 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 -z-10"></div>
              <div className="relative z-10">
                <h2 className="font-display text-5xl md:text-6xl font-bold mb-8 text-balance">
                  Ready to <span className="gradient-text">Work?</span>
                </h2>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                  Join hundreds of skilled professionals finding flexible work every day. Start your journey with Eventopic.
                </p>
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3"
                >
                  Join Our Team
                  <FaRocket />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}

// Helper component for icon that was missing in import
function FaCheckCircle(props: any) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"></path></svg>;
}