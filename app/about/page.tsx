import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-secondary text-dark">
      {/* Navigation */}
      <nav className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Eventopic</h1>
            <p className="text-sm">The Future of Showcasing</p>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="hover:text-light">Home</Link>
            <Link href="/about" className="hover:text-light">About</Link>
            <Link href="/services" className="hover:text-light">Services</Link>
            <Link href="/contact" className="hover:text-light">Contact</Link>
          </div>
        </div>
      </nav>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">About Eventopic</h2>
          <p className="text-lg text-center max-w-2xl mx-auto mb-8">
            Eventopic is a leading event management company based in Dubai with over 3 years of hands-on experience. Our dedicated team has successfully handled a wide variety of events, from intimate gatherings to large-scale productions. We specialize in providing promoters, staff, and volunteers for both private and government events.
          </p>
          <p className="text-lg text-center max-w-2xl mx-auto">
            We also offer short-term and part-time job opportunities, helping individuals gain valuable experience in the event industry. At Eventopic, we are committed to delivering exceptional service and creating unforgettable experiences.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Eventopic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}