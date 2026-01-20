//app/profile/page.tsx
"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
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
  FaCalendar,
  FaStar,
  FaImage,
  FaFileAlt,
  FaCheckCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaUpload,
  FaTrophy,
  FaChartLine,
  FaDownload
} from "react-icons/fa";
import Image from "next/image";
import axios from "axios";

interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  nationality: string;
  countryOfResidence: string;
  city: string;
  visaType: string;
  gender: string;
  languagesSpoken: string[];
  whatsappNumber: string;
  openToWorkIn: string[];
  hourlyRate: string;
  talents: string[];
  highestEducation: string;
  yearsOfExperience: string;
  previousRelatedExperience: string;
  availability: string;
  experienceDescription: string;
  secondNationality: string;
  hasCarInUAE: boolean;
  isProfileComplete: boolean;
  profileImageUrl?: string;
  resumeUrl?: string;
}

function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    nationality: "",
    countryOfResidence: "UAE",
    city: "",
    visaType: "",
    gender: "",
    languagesSpoken: [],
    whatsappNumber: "",
    openToWorkIn: [],
    hourlyRate: "",
    talents: [],
    highestEducation: "",
    yearsOfExperience: "",
    previousRelatedExperience: "",
    availability: "",
    experienceDescription: "",
    secondNationality: "",
    hasCarInUAE: false,
    isProfileComplete: false,
    profileImageUrl: "",
    resumeUrl: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  // Global skills database - comprehensive list
  const globalSkills = [
    // Hospitality & Events
    "Event Planning", "Event Coordination", "Guest Relations", "Front Desk", "Concierge",
    "Hospitality Management", "Customer Service", "VIP Services", "Conference Management",

    // Food & Beverage
    "Bartending", "Mixology", "Waitress/Waiter", "F&B Service", "Restaurant Management",
    "Catering", "Wine Service", "Barista", "Food Safety", "Menu Planning",

    // Sales & Marketing
    "Sales", "Retail", "Merchandising", "Brand Ambassador", "Promotions", "Cold Calling",
    "Lead Generation", "Customer Acquisition", "Social Media Marketing", "Digital Marketing",
    "Content Creation", "SEO", "Email Marketing", "Market Research", "Brand Management",

    // Creative & Entertainment
    "Modeling", "Acting", "Dancing", "Singing", "Photography", "Videography",
    "Video Editing", "Graphic Design", "UI/UX Design", "Web Design", "Animation",
    "Sound Engineering", "Music Production", "DJ", "MC/Hosting", "Voice Over",

    // Technical Skills
    "Microsoft Office", "Excel", "PowerPoint", "Google Suite", "Data Entry",
    "CRM Software", "Project Management", "Salesforce", "QuickBooks", "SAP",
    "HTML/CSS", "JavaScript", "Python", "Java", "SQL", "WordPress",

    // Beauty & Wellness
    "Hair Styling", "Makeup Artistry", "Nail Art", "Spa Therapy", "Massage",
    "Beauty Consulting", "Personal Training", "Yoga Instruction", "Nutrition",

    // Languages
    "English", "Arabic", "Hindi", "Urdu", "French", "Spanish", "Mandarin",
    "Russian", "German", "Italian", "Japanese", "Korean", "Portuguese",

    // Soft Skills
    "Communication", "Leadership", "Team Management", "Time Management",
    "Problem Solving", "Critical Thinking", "Adaptability", "Multitasking",
    "Attention to Detail", "Conflict Resolution", "Negotiation", "Public Speaking",

    // Office & Admin
    "Administrative Support", "Scheduling", "Bookkeeping", "Receptionist",
    "Document Management", "Meeting Coordination", "Travel Coordination",

    // Security & Safety
    "Security Management", "Crowd Control", "First Aid", "CPR Certified",
    "Risk Assessment", "Emergency Response", "Access Control",

    // Other Professional
    "Bilingual", "Multilingual", "Driver's License", "Car Available",
    "Flexible Schedule", "Weekend Availability", "Night Shifts",
  ];

  const handleSkillInput = (value: string) => {
    setSkillInput(value);

    if (value.length >= 2) {
      const filtered = globalSkills.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !skills.includes(skill)
      ).slice(0, 8); // Show top 8 suggestions
      setSuggestedSkills(filtered);
    } else {
      setSuggestedSkills([]);
    }
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput("");
      setSuggestedSkills([]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestedSkills.length > 0) {
        addSkill(suggestedSkills[0]); // Add first suggestion
      } else {
        addSkill(skillInput); // Add custom skill
      }
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string; visible: boolean }>({
    type: "success",
    message: "",
    visible: false,
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => setAlert({ type, message, visible: false }), 3000);
  };

  const cities = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Fujairah", "Ras Al Khaimah"];

  // FIXED: Properly load skills from user_skills collection
  useEffect(() => {
    if (pathname !== "/profile") return;
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const [userDoc, skillsDoc] = await Promise.all([
            getDoc(doc(db, "users", user.uid)),
            getDoc(doc(db, "user_skills", user.uid))
          ]);

          if (userDoc.exists()) {
            setProfile((prev) => ({ ...prev, ...userDoc.data() }));
          }

          // FIXED: Load skills from user_skills collection
          if (skillsDoc.exists()) {
            const skillsData = skillsDoc.data().skills || [];
            setSkills(skillsData);
          }

          setIsProfileLoaded(true);
        } catch (error) {
          console.error("Fetch profile error:", error);
          showAlert("error", "Error fetching profile. Please try again.");
        }
      };
      fetchProfile();
    }
  }, [user, loading, router, pathname]);

  const handleFileUpload = async (file: File | null, type: "image" | "resume") => {
    if (!file) {
      showAlert("error", "Please select a file to upload.");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showAlert("error", `${type === "image" ? "Image" : "Resume"} must be under 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (type === "image" && !validImageTypes.includes(file.type)) {
      showAlert("error", "Please upload a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (type === "resume" && !validDocTypes.includes(file.type)) {
      showAlert("error", "Please upload a valid document (PDF, DOC, DOCX)");
      return;
    }

    // Check for Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === 'root' || !uploadPreset) {
      showAlert("error", "⚠️ Cloudinary is not configured. Please set up your environment variables.");
      console.error("Missing Cloudinary config:", { cloudName, uploadPreset });
      return;
    }

    try {
      type === "image" ? setUploadingImage(true) : setUploadingResume(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "eventopic");

      // Use auto upload endpoint (works for both images and documents)
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      console.log(`Uploading ${type} to Cloudinary...`, { cloudName, uploadPreset, fileType: file.type });

      const response = await axios.post(uploadUrl, formData, {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      if (!response.data || !response.data.secure_url) {
        throw new Error("Invalid response from Cloudinary");
      }

      const url = response.data.secure_url;
      console.log(`Upload successful! URL: ${url}`);

      // Update Firestore
      await setDoc(doc(db, "users", user!.uid), {
        [type === "image" ? "profileImageUrl" : "resumeUrl"]: url,
      }, { merge: true });

      // Update local state
      setProfile((prev) => ({
        ...prev,
        [type === "image" ? "profileImageUrl" : "resumeUrl"]: url,
      }));

      // Clear file input
      if (type === "image") {
        setProfileImage(null);
      } else {
        setResume(null);
      }

      showAlert("success", `${type === "image" ? "Profile image" : "Resume"} uploaded successfully!`);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(`Upload error:`, error);

      let errorMessage = "Upload failed. Please try again.";

      if (error.response) {
        // Cloudinary returned an error
        const cloudinaryError = error.response.data?.error?.message || error.response.data?.message;
        if (cloudinaryError) {
          errorMessage = `Cloudinary error: ${cloudinaryError}`;
        }
        console.error("Cloudinary error response:", error.response.data);
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      showAlert("error", errorMessage);
    } finally {
      setUploadingImage(false);
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      showAlert("error", "Please sign in with a valid account.");
      return;
    }

    setUpdating(true);

    try {
      await setDoc(doc(db, "users", user.uid), { ...profile, isProfileComplete: true }, { merge: true });
      // FIXED: Save skills to user_skills collection
      await setDoc(doc(db, "user_skills", user.uid), { skills }, { merge: true });

      showAlert("success", "Profile saved successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("Save error:", error);
      showAlert("error", "Failed to save profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const calculateProfileCompletion = () => {
    const fields = [
      profile.firstName, profile.lastName, profile.dateOfBirth, profile.phoneNumber,
      profile.nationality, profile.city, profile.visaType, profile.gender,
      profile.whatsappNumber, profile.hourlyRate, profile.highestEducation,
      profile.yearsOfExperience, profile.availability, profile.profileImageUrl, profile.resumeUrl
    ].filter(Boolean).length;

    const arrays = [
      profile.languagesSpoken.length > 0,
      profile.openToWorkIn.length > 0,
      profile.talents.length > 0,
      skills.length > 0
    ].filter(Boolean).length;

    return Math.round(((fields + arrays) / 19) * 100);
  };

  // FIXED: Resume download function
  const handleDownloadResume = async (resumeUrl: string) => {
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.firstName}_${profile.lastName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      // Fallback to opening in new tab if download fails
      window.open(resumeUrl, '_blank');
    }
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading || !user || !isProfileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)]"></div>
      </div>
    );
  }

  // View Mode - MOBILE RESPONSIVE
  if (!isEditMode && profile.isProfileComplete) {
    return (
      <>
        <Navbar />
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 min-h-screen bg-[var(--background)] relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            {/* Header with Edit Button - MOBILE RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display gradient-text">
                Your Profile
              </h1>
              <motion.a
                href="/profile?edit=true"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2"
              >
                <FaEdit /> Edit Profile
              </motion.a>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column - Profile Card - MOBILE RESPONSIVE */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="glass-card overflow-hidden lg:sticky lg:top-24">
                  {/* Profile Image Header */}
                  <div className="relative h-32 sm:h-48 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
                    <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2">
                      {profile.profileImageUrl ? (
                        <Image
                          src={profile.profileImageUrl}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                          {profile.firstName[0]}{profile.lastName[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="pt-16 sm:pt-20 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-4">Professional Event Staff</p>

                    {/* Completion Badge */}
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-green-500/10 text-green-400 font-bold text-xs sm:text-sm mb-4 sm:mb-6">
                      <FaCheckCircle /> Profile {profileCompletion}% Complete
                    </div>

                    {/* Quick Stats - MOBILE RESPONSIVE */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                        <div className="text-xl sm:text-2xl font-bold text-[var(--primary)]">{profile.yearsOfExperience}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Years Exp.</div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                        <div className="text-xl sm:text-2xl font-bold text-[var(--primary)]">{skills.length}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Skills</div>
                      </div>
                    </div>

                    {/* Resume Download - FIXED */}
                    {profile.resumeUrl && (
                      <button
                        onClick={() => handleDownloadResume(profile.resumeUrl!)}
                        className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                      >
                        <FaDownload /> Download Resume
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Details - MOBILE RESPONSIVE */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 sm:p-6"
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display gradient-text flex items-center gap-2">
                    <FaUser /> Personal Information
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaCalendar className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Date of Birth</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate">{profile.dateOfBirth || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaVenusMars className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Gender</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] capitalize truncate">{profile.gender || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaGlobe className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Nationality</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate">{profile.nationality || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Location</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate">{profile.city || "Not set"}, UAE</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaIdCard className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Visa Type</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] capitalize truncate">{profile.visaType || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaPhone className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Phone Number</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] break-all">{profile.phoneNumber || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Skills & Expertise - FIXED AND IMPROVED DESIGN */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text flex items-center gap-2">
                      <FaStar /> Skills & Expertise
                    </h3>
                    <div className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs sm:text-sm">
                      {skills.length} Skills
                    </div>
                  </div>

                  {/* FIXED: Proper skills display */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {skills.length > 0 ? skills.map((skill, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-transform"
                      >
                        {skill}
                      </motion.span>
                    )) : (
                      <div className="w-full text-center py-8 border-2 border-dashed border-[var(--border)] rounded-xl">
                        <FaStar className="text-4xl text-[var(--text-secondary)]/20 mx-auto mb-2" />
                        <p className="text-sm sm:text-base text-[var(--text-secondary)]">No skills added yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Professional Details - MOBILE RESPONSIVE */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-4 sm:p-6"
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display gradient-text flex items-center gap-2">
                    <FaTrophy /> Professional Details
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaMoneyBillWave className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Hourly Rate</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate">AED {profile.hourlyRate || "0"}/hour</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaGraduationCap className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Education</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate">{profile.highestEducation || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaClock className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Availability</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)] break-words">{profile.availability || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FaCar className="text-sm sm:text-base text-[var(--primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1">Transport</p>
                        <p className="font-bold text-sm sm:text-base text-[var(--text-primary)]">{profile.hasCarInUAE ? "Has Car" : "No Car"}</p>
                      </div>
                    </div>
                  </div>

                  {profile.experienceDescription && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2">Experience Summary</p>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">{profile.experienceDescription}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Edit Mode - Keep remaining implementation...
  // (The edit mode continues with the same pattern of mobile responsiveness)
  return (
    <>
      <Navbar />
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 min-h-screen bg-[var(--background)] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <AnimatePresence>
            {alert.visible && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 ${alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
              >
                {alert.type === "success" ? <FaCheckCircle /> : <FaTimes />}
                <span className="font-bold text-sm sm:text-base">{alert.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display mb-3 sm:mb-4 gradient-text">
              {profile.isProfileComplete ? "Edit Your Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)]">
              Fill in your details to get discovered by top employers
            </p>

            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Profile Completion</span>
                <span className="text-xs sm:text-sm font-bold text-[var(--primary)]">{profileCompletion}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                />
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Profile Image Upload - MOBILE RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 sm:p-6"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display gradient-text flex items-center gap-2">
                <FaCamera /> Profile Photo
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-xl">
                    {profile.profileImageUrl ? (
                      <Image
                        src={profile.profileImageUrl}
                        alt="Profile"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center">
                        <FaUser className="text-5xl sm:text-6xl text-[var(--text-secondary)]/30" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 sm:p-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <FaCamera className="text-base sm:text-xl" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfileImage(file);
                          handleFileUpload(file, "image");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-[var(--text-primary)] mb-2">Upload Your Photo</h4>
                  <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] mb-3 sm:mb-4">
                    A professional photo helps you stand out. Max size: 5MB
                  </p>
                  {uploadingImage && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--primary)]">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-[var(--primary)]"></div>
                      <span className="text-xs sm:text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Resume Upload - MOBILE RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 sm:p-6"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display gradient-text flex items-center gap-2">
                <FaFileAlt /> Resume/CV
              </h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 sm:p-8 text-center hover:border-[var(--primary)] transition-colors">
                  <FaUpload className="text-3xl sm:text-4xl md:text-5xl text-[var(--text-secondary)]/30 mx-auto mb-3 sm:mb-4" />
                  <label className="block">
                    <span className="btn-primary px-4 sm:px-6 py-2 sm:py-3 cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base">
                      Choose PDF File
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResume(file);
                          handleFileUpload(file, "resume");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]/70 mt-3 sm:mt-4">Max size: 10MB</p>
                </div>

                {uploadingResume && (
                  <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-[var(--primary)]"></div>
                    <span className="text-xs sm:text-sm">Uploading resume...</span>
                  </div>
                )}

                {profile.resumeUrl && !uploadingResume && (
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--primary)]/30">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <FaCheckCircle className="text-green-400 text-base sm:text-xl flex-shrink-0" />
                      <span className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm truncate">Resume uploaded</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Basic Information - MOBILE RESPONSIVE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 sm:p-6"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display gradient-text flex items-center gap-2">
                <FaUser /> Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">First Name *</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Last Name *</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Date of Birth *</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Gender *</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Phone Number *</label>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={profile.whatsappNumber}
                    onChange={(e) => setProfile({ ...profile, whatsappNumber: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Nationality *</label>
                  <input
                    type="text"
                    value={profile.nationality}
                    onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">City *</label>
                  <select
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Visa Type *</label>
                  <select
                    value={profile.visaType}
                    onChange={(e) => setProfile({ ...profile, visaType: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Visa Type</option>
                    <option value="Visit Visa">Visit Visa</option>
                    <option value="Employment Visa">Employment Visa</option>
                    <option value="Residence Visa">Residence Visa</option>
                    <option value="Student Visa">Student Visa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Hourly Rate (AED) *</label>
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Years of Experience *</label>
                  <input
                    type="number"
                    value={profile.yearsOfExperience}
                    onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Highest Education</label>
                  <select
                    value={profile.highestEducation}
                    onChange={(e) => setProfile({ ...profile, highestEducation: e.target.value })}
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                  >
                    <option value="">Select Education</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor&apos;s</option>
                    <option value="Master's">Master&apos;s</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Availability</label>
                  <input
                    type="text"
                    value={profile.availability}
                    onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                    placeholder="e.g., Weekends, Full-time"
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm sm:text-base">
                    <input
                      type="checkbox"
                      checked={profile.hasCarInUAE}
                      onChange={(e) => setProfile({ ...profile, hasCarInUAE: e.target.checked })}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-[var(--border)]"
                    />
                    <FaCar className="text-sm sm:text-base" /> I have a car in UAE
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-[var(--text-primary)]">Experience Description</label>
                  <textarea
                    value={profile.experienceDescription}
                    onChange={(e) => setProfile({ ...profile, experienceDescription: e.target.value })}
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="w-full p-3 sm:p-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input resize-none text-sm sm:text-base"
                  />
                </div>
              </div>
            </motion.div>

            {/* Skills Selection - IMPROVED DESIGN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text flex items-center gap-2">
                  <FaStar /> Skills & Expertise
                </h3>
                <div className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs sm:text-sm">
                  {skills.length} Skills
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 sm:mb-6">
                Add your skills to help employers find you. Start typing and select from suggestions or add custom skills.
              </p>

              {/* Skill Input */}
              <div className="relative mb-4 sm:mb-6">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => handleSkillInput(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Type a skill (e.g., Event Planning, Bartending)..."
                  className="w-full p-3 sm:p-4 pr-16 sm:pr-24 rounded-xl border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none modern-input text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-xs sm:text-sm hover:scale-105 transition-transform"
                >
                  Add
                </button>

                {/* Auto-complete Suggestions */}
                {suggestedSkills.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-[var(--secondary)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto">
                    {suggestedSkills.map((skill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-[var(--primary)] transition-colors text-[var(--text-secondary)] border-b border-[var(--light)]/20 last:border-b-0 text-xs sm:text-sm"
                      >
                        <span className="font-semibold">{skill}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Skills Display */}
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-3">
                  Selected Skills ({skills.length})
                </p>

                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-transform"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 hover:bg-white/40 inline-flex items-center justify-center transition-colors"
                          aria-label={`Remove ${skill}`}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed border-[var(--border)] rounded-xl">
                    <FaStar className="text-3xl sm:text-4xl text-[var(--text-secondary)]/20 mx-auto mb-2" />
                    <p className="text-[var(--text-secondary)]/60 text-xs sm:text-sm">No skills added yet. Start typing!</p>
                  </div>
                )}
              </div>

              {/* Popular Skills Quick Add */}
              <div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-3">Quick Add Popular Skills</p>
                <div className="flex flex-wrap gap-2">
                  {["Event Planning", "Customer Service", "Bartending", "Photography", "Social Media", "Sales"].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      disabled={skills.includes(skill)}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full modern-input text-xs sm:text-sm border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <button
                type="submit"
                disabled={updating}
                className="btn-primary flex-1 py-3 sm:py-4 text-base sm:text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? "Saving..." : <><FaSave /> Save Profile</>}
              </button>

              {profile.isProfileComplete && (
                <a
                  href="/profile"
                  className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 text-base sm:text-lg"
                >
                  <FaTimes /> Cancel
                </a>
              )}
            </motion.div>
          </form>
        </div>
      </section>
    </>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)]"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
