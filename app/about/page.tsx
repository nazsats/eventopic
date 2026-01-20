//app/about/page.tsx
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
  FaShieldAlt
} from "react-icons/fa";

export default function About() {
  const timeline = [
    {
      year: "2021",
      event: "Founded in Dubai",
      desc: "Started with a vision to transform event experiences across the UAE",
      highlight: true
    },
    {
      year: "2022",
      event: "50+ Events Delivered",
      desc: "Established partnerships with major venues and brands across Dubai"
    },
    {
      year: "2023",
      event: "Industry Recognition",
      desc: "Became the trusted partner for government entities and Fortune 500 companies"
    },
    {
      year: "2024",
      event: "100+ Events & Growing",
      desc: "Expanded our team to 500+ professionals and launched digital platform",
      highlight: true
    },
  ];

  const values = [
    {
      icon: <FaRocket className="text-4xl gradient-text" />,
      title: "Innovation",
      desc: "We constantly evolve our services to deliver cutting-edge event experiences that set new industry standards.",
    },
    {
      icon: <FaHeart className="text-4xl gradient-text-accent" />,
      title: "Passion",
      desc: "Every event is crafted with dedication, creativity, and unwavering attention to the smallest details.",
    },
    {
      icon: <FaHandshake className="text-4xl gradient-text" />,
      title: "Integrity",
      desc: "Transparent communication, honest partnerships, and ethical practices drive everything we do.",
    },
    {
      icon: <FaAward className="text-4xl gradient-text-accent" />,
      title: "Excellence",
      desc: "We set exceptionally high standards and consistently exceed client expectations at every touchpoint.",
    },
    {
      icon: <FaLightbulb className="text-4xl gradient-text" />,
      title: "Creativity",
      desc: "Innovative solutions and fresh perspectives make every event unique and memorable.",
    },
    {
      icon: <FaShieldAlt className="text-4xl gradient-text-accent" />,
      title: "Reliability",
      desc: "Dependable service delivery and consistent quality you can trust for your most important events.",
    },
  ];

  const team = [
    {
      role: "Event Managers",
      count: "15+",
      desc: "Experienced professionals orchestrating seamless events",
      icon: <FaUsers className="text-3xl gradient-text" />,
    },
    {
      role: "Skilled Staff",
      count: "500+",
      desc: "Trained hosts, coordinators, and technical crew",
      icon: <FaStar className="text-3xl gradient-text-accent" />,
    },
    {
      role: "Trusted Vendors",
      count: "50+",
      desc: "Premium partners for sound, lighting, and décor",
      icon: <FaGem className="text-3xl gradient-text" />,
    },
  ];

  const achievements = [
    { label: "Years of Excellence", value: "3+", suffix: "" },
    { label: "Events Delivered", value: "100", suffix: "+" },
    { label: "Happy Clients", value: "50", suffix: "+" },
    { label: "Team Members", value: "500", suffix: "+" },
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="section-hero relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container relative z-10 min-h-screen flex flex-col justify-center items-center text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto shadow-2xl">
                <FaRocket className="text-3xl text-white" />
              </div>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Crafting <span className="gradient-text">Unforgettable</span> Experiences
            </h1>

            <p className="text-xl md:text-2xl mb-12 leading-relaxed text-[var(--text-secondary)] max-w-3xl mx-auto">
              Since 2021, Eventopic has been Dubai&apos;s trusted partner for world-class event management
              and professional staffing solutions that exceed expectations.
            </p>

            {/* Achievement Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="stat-card"
                >
                  <div className="stat-number">{achievement.value}{achievement.suffix}</div>
                  <div className="stat-label">{achievement.label}</div>
                </motion.div>
              ))}
            </motion.div>
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
                To transform visions into reality through innovative event solutions, exceptional service,
                and a passionate team committed to creating memorable experiences that inspire and connect
                people across Dubai and beyond.
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
                To be the UAE&apos;s most trusted and innovative event management company, setting new standards
                in creativity, professionalism, and client satisfaction while empowering our team to excel
                and grow in their careers.
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
                title: "Full-Service Events",
                desc: "From concept to cleanup, we handle weddings, corporate galas, product launches, and cultural festivals with meticulous attention to every detail and seamless execution.",
                icon: <FaRocket className="text-4xl gradient-text mb-4" />,
              },
              {
                title: "Professional Staffing",
                desc: "Our expertly trained team includes hosts, coordinators, security personnel, technical crew, and brand ambassadors ready to elevate your event experience.",
                icon: <FaUsers className="text-4xl gradient-text-accent mb-4" />,
              },
              {
                title: "End-to-End Solutions",
                desc: "We manage vendors, marketing campaigns, content creation, sponsorship coordination, and logistics so you can focus on what matters most to your business.",
                icon: <FaGem className="text-4xl gradient-text mb-4" />,
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

      {/* Timeline */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-bold text-center mb-16 text-balance"
          >
            Our <span className="gradient-text-accent">Journey</span>
          </motion.h2>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0 text-right w-20">
                  <span className={`font-display text-2xl font-bold ${item.highlight ? 'gradient-text' : 'text-[var(--primary)]'}`}>
                    {item.year}
                  </span>
                </div>

                <div className="flex-shrink-0 relative">
                  <div className={`w-4 h-4 rounded-full ${item.highlight ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]' : 'bg-[var(--secondary)]'} mt-2 relative z-10`} />
                  {index < timeline.length - 1 && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-[var(--border)]" />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className={`glass-card p-6 ${item.highlight ? 'border-[var(--primary)]' : ''}`}>
                    <h3 className="font-heading text-2xl font-bold mb-3 text-[var(--text-primary)]">
                      {item.event}
                    </h3>
                    <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="section-standard">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-6xl font-bold text-center mb-16 text-balance"
          >
            Meet Our <span className="gradient-text">Team</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
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
                  <div className="mb-4">{member.icon}</div>
                  <div className="text-5xl font-display font-bold mb-3 gradient-text">
                    {member.count}
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3 text-[var(--text-primary)]">
                    {member.role}
                  </h3>
                  <p className="text-base text-[var(--text-secondary)]">
                    {member.desc}
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
                  Ready to Work <span className="gradient-text">Together?</span>
                </h2>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                  Let&apos;s create something extraordinary. Get in touch with our team today and bring your vision to life.
                </p>
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3"
                >
                  Contact Us Today
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