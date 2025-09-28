
import { FaInstagram, FaFacebookF, FaEnvelope, FaLinkedin } from "react-icons/fa";

const socialLinks = [
  { href: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/eventopic-staffing-b037b6383", icon: <FaLinkedin />, label: "LinkedIn" },
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/eventopic_staffing", icon: <FaInstagram />, label: "Instagram" },
  { href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/share/1C7GsbB6Zr/", icon: <FaFacebookF />, label: "Facebook" },
  { href: "mailto:info@eventopic.com", icon: <FaEnvelope />, label: "Email" },
];

export default function Footer() {
  return (
    <footer className="py-12 bg-[var(--primary)] border-t border-[var(--light)]/20">
      <div className="container mx-auto text-center px-4">
        <div className="flex justify-center space-x-8 mb-6">
          {socialLinks.map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl text-[var(--text-body)] hover:text-[var(--text-accent)] transition-all duration-300 hover:scale-110"
              aria-label={`Visit Eventopic on ${label}`}
            >
              {icon}
            </a>
          ))}
        </div>
        <div className="flex justify-center space-x-4 mb-4 text-sm text-[var(--text-body)]">
          <a href="/about" className="hover:text-[var(--text-accent)] transition-colors">About</a>
          <a href="/services" className="hover:text-[var(--text-accent)] transition-colors">Services</a>
          <a href="/contact" className="hover:text-[var(--text-accent)] transition-colors">Contact</a>
        </div>
        <p className="text-lg font-medium font-body text-[var(--text-body)]">&copy; 2025 Eventopic. All rights reserved.</p>
      </div>
    </footer>
  );
}
