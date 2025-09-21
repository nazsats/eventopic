"use client";

import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { FaInstagram, FaFacebookF, FaEnvelope, FaCalendarAlt, FaUsers, FaCheckCircle, FaStar, FaLinkedin } from "react-icons/fa";

interface GalleryImage {
  src: string;
  alt: string;
  desc: string;
  category: string;
}

export default function Home() {
  const galleryImages: GalleryImage[] = [
    { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding setup", category: "Weddings" },
    { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference", category: "Corporate" },
    { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch", category: "Promotions" },
    { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Rooftop party", category: "Parties" },
    { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Cultural festival", category: "Cultural" },
    { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "Gala dinner", category: "Corporate" },
  ];

  const stats = [
    { number: "3+", label: "Years Experience", icon: <FaCalendarAlt /> },
    { number: "100+", label: "Events Managed", icon: <FaCheckCircle /> },
    { number: "500+", label: "Profession Staff", icon: <FaUsers /> },
  ];

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } },
  } as const;

  const staggerChildren: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
    hover: { scale: 1.05, y: -5, transition: { duration: 0.3 } },
  };

  const SkeletonLoader = () => (
    <div className="break-inside-avoid rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--soft)", width: "100%", height: "300px" }}>
      <div className="animate-pulse h-full w-full bg-[var(--light)]/50"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: "linear-gradient(to bottom, var(--accent), var(--primary))", color: "var(--white)" }}>
        <div className="hero-bg absolute inset-0">
          <Image
            src="/gallery/BurjKhalifa.png"
            alt="Dubai Skyline - Burj Khalifa, Symbolizing Luxury Events with Eventopic"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            quality={85}
            priority
            className="brightness-50 sepia-[10%] hue-rotate-[200deg]"
            onError={() => console.error("Failed to load hero image: /gallery/BurjKhalifa.png")}
          />
        </div>
        <div className="absolute inset-0 bg-[var(--accent)]/40 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center items-center text-center h-full py-20">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-heading leading-tight"
            style={{ color: "var(--white)" }}
          >
            <span className="eventopic-title">Eventopic</span>
          </motion.h1>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl mb-8 font-body opacity-90"
            style={{ color: "var(--white)" }}
          >
            The Future Of Showcasing
          </motion.p>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-body opacity-80"
            style={{ color: "var(--light)" }}
          >
            Dubai&apos;s trusted partner for luxury event management and professional staffing. Create unforgettable moments with our expert team.
          </motion.p>
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center items-center space-x-8 md:space-x-12 mb-12 gap-4 md:gap-0"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={textVariants}
                className="text-center p-4 rounded-xl bg-[var(--accent)]/30"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 font-heading" style={{ color: "var(--white)" }}>
                  {stat.number}
                </div>
                <div className="text-sm md:text-base opacity-70 flex items-center gap-1 justify-center font-body" style={{ color: "var(--light)" }}>
                  {stat.icon} {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link
                href="/contact"
                className="px-8 py-4 rounded-2xl text-lg font-semibold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block border-2 border-[var(--white)] hover:border-[var(--accent)]"
                style={{ background: "transparent", color: "var(--white)" }}
                aria-label="Get a Free Quote"
              >
                Get a Free Quote
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Link
                href="/contact#staff-form"
                className="px-8 py-4 rounded-2xl text-lg font-semibold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--teal-accent))", color: "#ffffff" }}
                aria-label="Join the Team"
              >
                Join the Team
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Eventopic */}
      <section className="py-24 relative" style={{ background: "linear-gradient(to right, var(--primary), var(--accent))" }}>
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading"
            style={{ color: "var(--white)" }}
          >
            Why Choose Eventopic?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCalendarAlt className="text-5xl md:text-6xl mb-6 mx-auto" style={{ color: "var(--accent)" }} />,
                title: "Expert Planning",
                desc: "From concept to cleanup, our end-to-end event management ensures every detail is perfect for your Dubai event.",
              },
              {
                icon: <FaUsers className="text-5xl md:text-6xl mb-6 mx-auto" style={{ color: "var(--teal-accent)" }} />,
                title: "Professional Staffing",
                desc: "Skilled promoters, hostesses, ushers, and volunteers tailored to make your event seamless and memorable.",
              },
              {
                icon: <FaCheckCircle className="text-5xl md:text-6xl mb-6 mx-auto" style={{ color: "var(--accent)" }} />,
                title: "Flawless Execution",
                desc: "Over 100 events delivered with precision in Dubai, turning your vision into reality.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card p-8 rounded-2xl shadow-xl text-center relative overflow-hidden group bg-[var(--primary)]/50 backdrop-blur-sm border border-[var(--accent)]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--teal-accent)]/10 to-[var(--accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">{feature.icon}</div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4 font-heading" style={{ color: "var(--white)" }}>
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed font-body" style={{ color: "var(--light)" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 relative" style={{ background: "linear-gradient(to left, var(--primary), var(--accent))" }}>
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 font-heading"
            style={{ color: "var(--white)" }}
          >
            Our Event Portfolio
          </motion.h2>
          <p className="text-center mb-12 text-lg md:text-xl font-body opacity-80" style={{ color: "var(--light)" }}>
            Discover highlights from our luxurious events across Dubai.
          </p>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.length === 0
              ? Array.from({ length: 3 }).map((_, index) => <SkeletonLoader key={index} />)
              : galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    className="break-inside-avoid rounded-2xl overflow-hidden card relative group"
                    style={{ position: "relative", width: "100%", height: "300px" }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      quality={85}
                      loading={index > 2 ? "lazy" : "eager"}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      onError={() => console.error(`Failed to load image: ${image.src}`)}
                    />
                    <div className="absolute inset-0 bg-[var(--accent)]/70 backdrop-blur-sm flex flex-col justify-end p-6 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <span className="text-lg font-semibold font-body" style={{ color: "#ffffff" }}>
                        {image.desc}
                      </span>
                      <span className="text-sm font-body" style={{ color: "#f0f0f0" }}>
                        {image.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/gallery"
              className="px-8 py-4 rounded-2xl text-lg font-semibold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block border-2 border-[var(--white)] hover:border-[var(--accent)] hover:scale-105"
              style={{ background: "transparent", color: "var(--white)" }}
              aria-label="Explore Full Gallery"
            >
              Explore Full Gallery
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative" style={{ background: "linear-gradient(to right, var(--accent), var(--primary))" }}>
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading"
            style={{ color: "var(--white)" }}
          >
            What Our Clients Say
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "Eventopic’s volunteers were an absolute game-changer for the Beach Soccer FIFA 2024 tournament. Their team was professional, enthusiastic, and incredibly well-organized. They seamlessly managed crowd control, assisted with event logistics, and ensured our attendees had a fantastic experience. Their commitment and positive attitude were instrumental to the event's success. We look forward to partnering with Eventopic again in the future.", name: " Head of Operations, Beach Soccer FIFA 2024", rating: 5 },
              { quote: "For our recent corporate events, we relied on Eventopic to provide all our staffing needs. The team they provided was top-tier—highly trained, courteous, and efficient. They handled everything from guest registration to information desks with a level of professionalism that truly elevated our brand. Their staff integrated perfectly with our team and contributed significantly to the polished and professional atmosphere we wanted to create. Eventopic is our go-to for staffing solutions.", name: "Marketing Director, AYS Real Estate Company", rating: 5 },
              { quote: "We needed a skilled video creator for a series of new promotional campaigns, and Eventopic delivered beyond our expectations. The video creator they provided was not only technically proficient but also brought a creative and strategic vision to the project. The final videos were of exceptional quality and perfectly captured our brand's message. Eventopic's ability to match us with the right talent for this specialized task was impressive. We highly recommend them for their excellent service.", name: "CEO, New Link Consultancy", rating: 5 },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card p-6 rounded-2xl shadow-xl relative overflow-hidden group bg-[var(--primary)]/50 backdrop-blur-sm border border-[var(--accent)]/20 italic"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-[var(--accent)]" />
                  ))}
                </div>
                <p className="mb-4 text-lg font-body" style={{ color: "var(--light)" }}>
                  {testimonial.quote}
                </p>
                <p className="font-semibold text-right font-body" style={{ color: "var(--white)" }}>
                  - {testimonial.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 relative" style={{ background: "linear-gradient(to left, var(--accent), var(--primary))" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-8 font-heading"
            style={{ color: "var(--white)" }}
          >
            Ready to Elevate Your Event?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
            style={{ color: "var(--light)" }}
          >
            With over 3 years in Dubai&apos;s dynamic event scene, Eventopic is your partner for staffing, planning, and execution. Let&apos;s create memories that last.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
          >
            <Link
              href="/about"
              className="px-8 py-4 rounded-2xl text-lg font-semibold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block border-2 border-[var(--white)] hover:border-[var(--accent)] hover:scale-105"
              style={{ background: "transparent", color: "var(--white)" }}
              aria-label="Discover More About Eventopic"
            >
              Discover More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ChatBot */}
      <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-full">
        <ChatBot />
      </div>

      {/* Footer */}
      <footer className="py-12 relative" style={{ backgroundColor: "var(--primary)", color: "var(--white)", borderTop: "1px solid var(--accent)/20" }}>
        <div className="container mx-auto text-center px-4 relative z-10">
          <div className="flex justify-center space-x-8 mb-6">
            <a
              href="https://www.linkedin.com/in/eventopic-staffing-b037b6383?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-[var(--accent)] transition-all duration-300 hover:scale-110"
              aria-label="Visit Eventopic on LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://www.instagram.com/eventopic_staffing?igsh=MTk5dTN4bjdnczh1aA%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-[var(--accent)] transition-all duration-300 hover:scale-110"
              aria-label="Visit Eventopic on Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/share/1C7GsbB6Zr/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-[var(--accent)] transition-all duration-300 hover:scale-110"
              aria-label="Visit Eventopic on Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="mailto:info@eventopic.com"
              className="text-2xl hover:text-[var(--accent)] transition-all duration-300 hover:scale-110"
              aria-label="Email Eventopic"
            >
              <FaEnvelope />
            </a>
          </div>
          <p className="text-lg font-medium font-body">&copy; 2025 Eventopic. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}