
"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useState } from "react";

interface GalleryImage {
  src: string;
  alt: string;
  desc: string;
  category: string;
}

const galleryImages: GalleryImage[] = [
  { src: "/gallery/event1.png", alt: "Luxurious Wedding Event in Dubai by Eventopic", desc: "Elegant wedding at Burj Al Arab", category: "Weddings" },
  { src: "/gallery/event2.png", alt: "Corporate Gala in Dubai - Eventopic Management", desc: "Tech conference at DWTC", category: "Corporate" },
  { src: "/gallery/event3.png", alt: "Brand Activation Event in Dubai", desc: "Product launch with promoters", category: "Promotions" },
  { src: "/gallery/event4.png", alt: "Private Party in Dubai by Eventopic", desc: "Exclusive rooftop party", category: "Parties" },
  { src: "/gallery/event5.png", alt: "Cultural Event in Dubai - Eventopic Staffing", desc: "Government cultural festival", category: "Cultural" },
  { src: "/gallery/event6.png", alt: "Luxury Event in Dubai - Eventopic Planning", desc: "High-profile gala dinner", category: "Corporate" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [visibleImages, setVisibleImages] = useState(3);
  const imagesPerPage = 3;

  const categories = ["All", "Weddings", "Corporate", "Promotions", "Parties", "Cultural"];
  const filteredImages = filter === "All" ? galleryImages : galleryImages.filter((img) => img.category === filter);
  const paginatedImages = filteredImages.slice(0, visibleImages);

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 10 } },
  } as const;

  const containerVariants: Variants = {
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80 } },
    hover: {
      scale: 1.1,
      y: -5,
      boxShadow: "0 8px 24px rgba(0, 196, 180, 0.4)",
      backgroundColor: "var(--teal-accent)",
      borderColor: "var(--teal-accent)",
      transition: { duration: 0.3 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 100 } },
  };

  const SkeletonLoader = () => (
    <div className="break-inside-avoid rounded-2xl overflow-hidden border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm" style={{ width: "100%", minHeight: "300px" }}>
      <div className="animate-pulse h-full w-full bg-[var(--light)]/50"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <section className="py-24 relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl font-bold mb-8 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Eventopic Gallery
          </motion.h1>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-3xl mx-auto mb-12 font-body leading-relaxed text-[var(--text-body)]"
          >
            Explore our portfolio of unforgettable events in Dubai &ndash; from luxurious weddings to high-energy corporate activations, crafted with precision by Eventopic.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                variants={buttonVariants}
                onClick={() => {
                  setFilter(category);
                  setVisibleImages(imagesPerPage);
                }}
                className={`px-8 py-3 rounded-full text-lg font-bold font-body transition-all duration-300 group relative ${
                  filter === category ? "bg-[var(--accent)] text-[var(--white)] shadow-xl" : "bg-[var(--primary)]/80 text-[var(--text-accent)] border border-[var(--light)]/30"
                }`}
                style={filter === category ? { backgroundColor: "var(--accent)", border: "2px solid var(--light)" } : {}}
                aria-label={`Filter by ${category}`}
              >
                {category}
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Our Signature Events
          </motion.h2>
          <motion.div
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {paginatedImages.length === 0
              ? Array.from({ length: 3 }).map((_, index) => <SkeletonLoader key={index} />)
              : paginatedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="break-inside-avoid rounded-2xl overflow-hidden card relative border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm group"
                    style={{ width: "100%", minHeight: "300px" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--teal-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110 relative z-10"
                      quality={85}
                      loading={index < 3 ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      onError={() => console.error(`Failed to load image: ${image.src}`)}
                    />
                    <div className="absolute inset-0 bg-[var(--accent)]/80 backdrop-blur-sm flex flex-col justify-end p-6 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 relative z-10">
                      <span className="text-lg font-semibold font-body text-[var(--white)]">{image.desc}</span>
                      <span className="text-lg font-body text-[var(--text-body)]">{image.category}</span>
                    </div>
                  </motion.div>
                ))}
          </motion.div>
          {visibleImages < filteredImages.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="text-center mt-12 group relative"
            >
              <motion.button
                variants={buttonVariants}
                onClick={() => setVisibleImages((prev) => prev + imagesPerPage)}
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="Load More Images"
              >
                Load More
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </motion.button>
            </motion.div>
          )}
          {paginatedImages.length === 0 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="text-center text-lg font-body text-[var(--text-body)] mt-12"
            >
              No events found in this category. Explore others!
            </motion.p>
          )}
        </div>
      </section>

      <section className="py-24 relative" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute inset-0 bg-[var(--color-accent)]/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-8 font-heading text-[var(--text-accent)] text-shadow"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
          >
            Plan Your Next Unforgettable Event
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body text-[var(--text-body)]"
          >
            From concept to execution, Eventopic delivers world-class events in Dubai&apos;s vibrant scene with professional staffing and flawless planning.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <motion.div variants={buttonVariants}>
              <Link
                href="/contact"
                className="px-10 py-4 rounded-full text-xl font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 inline-block focus:ring-4 focus:ring-[var(--teal-accent)]/50 relative z-10"
                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                aria-label="Get a Free Quote"
              >
                Get a Free Quote
                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
