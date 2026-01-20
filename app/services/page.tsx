//app/services/page.tsx
"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  FaCalendarCheck,
  FaUsers,
  FaTools,
  FaBullhorn,
  FaDollarSign,
  FaChartLine,
  FaBuilding,
  FaBriefcase,
  FaCamera,
  FaLightbulb,
  FaHandshake,
  FaMicrophone
} from "react-icons/fa";
import Link from "next/link";

export default function Services() {
  const services = [
    {
      icon: <FaCalendarCheck className="text-5xl text-[var(--primary)]" />,
      title: "Event Management",
      desc: "Complete planning and execution for weddings, corporate events, product launches, and celebrations.",
      features: ["Concept Development", "Timeline Planning", "Budget Management", "Day-of Coordination"],
      gradient: "from-[var(--primary)]/20 to-[var(--secondary)]/20",
    },
    {
      icon: <FaUsers className="text-5xl text-[var(--accent)]" />,
      title: "Professional Staffing",
      desc: "Skilled hosts, hostesses, ushers, coordinators, and security personnel for seamless service.",
      features: ["Event Hosts", "Security Teams", "Coordinators", "VIP Services"],
      gradient: "from-[var(--accent)]/20 to-[var(--primary)]/20",
    },
    {
      icon: <FaTools className="text-5xl text-[var(--secondary)]" />,
      title: "Technical Support",
      desc: "Expert setup crews, technical teams, and backstage staff ensuring flawless operations.",
      features: ["Audio/Visual Setup", "Stage Management", "Equipment Rental", "Technical Crew"],
      gradient: "from-[var(--secondary)]/20 to-[var(--accent)]/20",
    },
    {
      icon: <FaBullhorn className="text-5xl text-[var(--primary)]" />,
      title: "Brand Activation",
      desc: "Engaging promoters and brand ambassadors to amplify your message and connect with audiences.",
      features: ["Product Launches", "Sampling Campaigns", "Street Marketing", "Experiential Events"],
      gradient: "from-[var(--primary)]/20 to-[var(--accent)]/20",
    },
    {
      icon: <FaDollarSign className="text-5xl text-[var(--accent)]" />,
      title: "Sponsorship Solutions",
      desc: "Strategic partnerships and sponsorship management to enhance event reach and funding.",
      features: ["Sponsor Acquisition", "Package Development", "Activation Planning", "ROI Tracking"],
      gradient: "from-[var(--accent)]/20 to-[var(--secondary)]/20",
    },
    {
      icon: <FaChartLine className="text-5xl text-[var(--secondary)]" />,
      title: "Marketing & PR",
      desc: "Comprehensive campaigns including digital marketing, social media, and on-ground activations.",
      features: ["Social Media Strategy", "Press Releases", "Influencer Partnerships", "Content Marketing"],
      gradient: "from-[var(--secondary)]/20 to-[var(--primary)]/20",
    },
    {
      icon: <FaCamera className="text-5xl text-[var(--primary)]" />,
      title: "Content Creation",
      desc: "Professional photography, videography, and editing services to capture your event's essence.",
      features: ["Event Photography", "Video Production", "Live Streaming", "Post-Production"],
      gradient: "from-[var(--primary)]/20 to-[var(--accent)]/20",
    },
    {
      icon: <FaBuilding className="text-5xl text-[var(--accent)]" />,
      title: "Corporate Services",
      desc: "Tailored HR solutions for temporary staffing needs and complete vendor management.",
      features: ["Temp Staffing", "Vendor Coordination", "Team Building Events", "Corporate Retreats"],
      gradient: "from-[var(--accent)]/20 to-[var(--secondary)]/20",
    },
  ];

  const process = [
    {
      step: "01",
      title: "Consultation",
      desc: "We understand your vision, goals, and requirements through detailed discussions.",
      icon: <FaLightbulb />,
    },
    {
      step: "02",
      title: "Planning",
      desc: "Our team creates a comprehensive plan with timelines, budgets, and creative concepts.",
      icon: <FaHandshake />,
    },
    {
      step: "03",
      title: "Execution",
      desc: "Professional staff and vendors bring your event to life with precision and care.",
      icon: <FaMicrophone />,
    },
    {
      step: "04",
      title: "Follow-up",
      desc: "We gather feedback and provide post-event reports to ensure continuous improvement.",
      icon: <FaChartLine />,
    },
  ];

  const packages = [
    {
      name: "Starter",
      price: "Contact for Pricing",
      features: [
        "Event consultation",
        "Basic planning support",
        "Vendor recommendations",
        "Day-of coordination",
      ],
      recommended: false,
    },
    {
      name: "Professional",
      price: "Contact for Pricing",
      features: [
        "Full event management",
        "Professional staffing",
        "Marketing support",
        "Content creation",
        "Vendor management",
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "Contact for Pricing",
      features: [
        "Comprehensive solutions",
        "Dedicated event manager",
        "Custom branding",
        "VIP services",
        "Post-event analytics",
        "24/7 support",
      ],
      recommended: false,
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
              Our Services
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed text-[var(--text-secondary)] font-light">
              Comprehensive event solutions tailored to create exceptional experiences across Dubai and the UAE.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-[var(--background)] relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 glass-card relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-center font-display text-[var(--text-primary)]">
                    {service.title}
                  </h3>
                  <p className="text-sm mb-6 text-center text-[var(--text-secondary)] leading-relaxed">
                    {service.desc}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-3 text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
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

      {/* Packages Section */}
      <section className="py-20 bg-[var(--background)] relative">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-display gradient-text"
          >
            Service Packages
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`p-8 rounded-3xl border transition-all relative glass-card ${pkg.recommended
                  ? "border-[var(--primary)] shadow-[0_0_30px_rgba(0,212,255,0.1)]"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-3xl font-bold mb-4 text-center font-display text-[var(--text-primary)]">
                  {pkg.name}
                </h3>
                <p className="text-xl font-bold mb-8 text-center text-[var(--accent)]">
                  {pkg.price}
                </p>
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[var(--text-secondary)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block w-full py-4 rounded-full text-center font-bold transition-all hover:scale-105 shadow-lg ${pkg.recommended
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:shadow-[var(--primary)]/25"
                    : "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                >
                  Get Started
                </Link>
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
              Let&apos;s Create Your Perfect Event
            </h2>
            <p className="text-xl mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto font-light">
              Contact our team for a personalized consultation and custom quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-10 py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:shadow-[var(--primary)]/30"
              >
                Request a Quote
              </motion.a>
              <motion.a
                href="/portal/applications"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--primary)]"
              >
                <FaBriefcase />
                Join Our Team
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}