"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaPhone, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaVenusMars, 
  FaMoneyBillWave, 
  FaGraduationCap, 
  FaClock, 
  FaCar, 
  FaStar,
  FaCalendar
} from "react-icons/fa";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    nationality: "",
    countryOfResidence: "UAE",
    region: "",
    city: "",
    visaType: "",
    gender: "",
    languagesSpoken: [] as string[],
    whatsappNumber: "",
    openToWorkIn: [] as string[],
    hourlyRate: "",
    talents: [] as string[],
    highestEducation: "",
    yearsOfExperience: "",
    previousRelatedExperience: "",
    availability: "",
    experienceDescription: "",
    secondNationality: "",
    hasCarInUAE: false,
    isProfileComplete: false,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth?mode=signin");
      return;
    }
    if (user) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.email!));
          const skillsDoc = await getDoc(doc(db, "user_skills", user.email!));
          if (userDoc.exists()) {
            setProfile((prev) => ({ ...prev, ...userDoc.data() }));
          } else {
            toast.error("No profile found. Please create your profile.");
            router.push("/profile");
            return;
          }
          if (skillsDoc.exists()) {
            setSkills(skillsDoc.data().skills || []);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Fetch profile error:", error);
          toast.error("Error fetching profile. Please try again.");
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, loading, router, profile]); // Added 'profile' to dependencies

  if (loading || isLoading) {
    return <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>;
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <section className="py-20 bg-[var(--secondary)] min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 font-heading relative" 
            style={{ color: "var(--white)", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            Your Dashboard
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="card p-8 rounded-2xl shadow-2xl border border-[var(--accent)]/30 bg-[var(--primary)]/70 backdrop-blur-md">
              <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2" style={{ color: "var(--color-accent)" }}>
                <FaUser /> Your Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaUser /> <strong>Name:</strong> {profile.firstName} {profile.lastName}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaCalendar /> <strong>Date of Birth:</strong> {profile.dateOfBirth || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaPhone /> <strong>Phone Number:</strong> {profile.phoneNumber || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaPhone /> <strong>WhatsApp Number:</strong> {profile.whatsappNumber || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaGlobe /> <strong>Nationality:</strong> {profile.nationality || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaGlobe /> <strong>Second Nationality:</strong> {profile.secondNationality || "None"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaVenusMars /> <strong>Gender:</strong> {profile.gender || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaMapMarkerAlt /> <strong>Location:</strong> {profile.city}, {profile.region}, {profile.countryOfResidence}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaIdCard /> <strong>Visa Type:</strong> {profile.visaType || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaGlobe /> <strong>Languages Spoken:</strong> {profile.languagesSpoken.length > 0 ? profile.languagesSpoken.join(", ") : "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaMapMarkerAlt /> <strong>Open to Work In:</strong> {profile.openToWorkIn.length > 0 ? profile.openToWorkIn.join(", ") : "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaMoneyBillWave /> <strong>Hourly Rate (AED):</strong> {profile.hourlyRate || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaGraduationCap /> <strong>Highest Education:</strong> {profile.highestEducation || "Not set"}
                  </p>
                  <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                    <FaCar /> <strong>Car in UAE:</strong> {profile.hasCarInUAE ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                  <FaClock /> <strong>Years of Experience:</strong> {profile.yearsOfExperience || "Not set"}
                </p>
                <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                  <FaClock /> <strong>Availability:</strong> {profile.availability || "Not set"}
                </p>
                <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                  <FaGlobe /> <strong>Previous Related Experience:</strong> {profile.previousRelatedExperience || "Not set"}
                </p>
                <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                  <FaGlobe /> <strong>Experience Description:</strong> {profile.experienceDescription || "Not set"}
                </p>
                <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                  <FaStar /> <strong>Talents:</strong> {profile.talents.length > 0 ? profile.talents.join(", ") : "Not set"}
                </p>
                <p className="flex items-center gap-2 mb-4" style={{ color: "var(--light)" }}>
                  <FaStar /> <strong>Skills:</strong> {skills.length > 0 ? skills.join(", ") : "Not set"}
                </p>
              </div>
              <Link
                href="/profile?edit=true"
                className="mt-6 inline-block px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))", color: "var(--primary)" }}
              >
                Edit Profile
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}