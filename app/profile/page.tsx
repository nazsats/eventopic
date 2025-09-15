"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaMoon,
  FaSun,
  FaUser,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaIdCard,
  FaVenusMars,
  FaGlobeAmericas,
  FaMoneyBillWave,
  FaGraduationCap,
  FaClock,
  FaCar,
  FaCalendar,
  FaExclamationTriangle,
  FaStar,
} from "react-icons/fa";

// Child component that uses useSearchParams
function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    nationality: "",
    countryOfResidence: "UAE",
    city: "", // Renamed from region
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
  const [step, setStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

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
            if (userDoc.data().isProfileComplete && !isEditMode) {
              router.push("/dashboard");
              return;
            }
          }
          if (skillsDoc.exists()) {
            setSkills(skillsDoc.data().skills || []);
          }
        } catch (error: unknown) {
          console.error("Fetch profile error:", error);
          toast.error("Error fetching profile. Please try again.");
        }
      };
      fetchProfile();
    }
  }, [user, loading, router, isEditMode]);

  const validateField = (name: string, value: string | string[]) => {
    const newErrors = { ...errors };
    let isValid = true;

    if (
      [
        "firstName",
        "lastName",
        "dateOfBirth",
        "phoneNumber",
        "nationality",
        "city", // Renamed from region
        "visaType",
        "gender",
        "hourlyRate",
        "yearsOfExperience",
      ].includes(name) &&
      !value
    ) {
      newErrors[name] = `${name.replace(/([A-Z])/g, " $1").trim()} is required`;
      isValid = false;
    } else if (
      name === "phoneNumber" &&
      typeof value === "string" &&
      value &&
      !/^\+971\d{9}$/.test(value)
    ) {
      newErrors[name] =
        "Phone must be +971xxxxxxxxx (no spaces, e.g., +971501234567)";
      isValid = false;
    } else if (
      name === "hourlyRate" &&
      typeof value === "string" &&
      value &&
      (isNaN(Number(value)) || Number(value) <= 0)
    ) {
      newErrors[name] = "Hourly rate must be > 0 (e.g., 50)";
      isValid = false;
    } else if (Array.isArray(value) && value.length === 0) {
      newErrors[name] = `${name.replace(/([A-Z])/g, " $1").trim()} cannot be empty`;
      isValid = false;
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    validateField(name, value);
  };

  const handleMultiSelectChange = (name: string, values: string[]) => {
    setProfile({ ...profile, [name]: values });
    validateField(name, values);
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.email) {
      toast.error("Please sign in with a valid email.");
      setUpdating(false);
      return;
    }

    setUpdating(true);

    const requiredFields = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "phoneNumber",
      "nationality",
      "city", // Renamed from region
      "visaType",
      "gender",
      "hourlyRate",
      "yearsOfExperience",
    ];
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      const value = profile[field as keyof typeof profile];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(`Fix these: ${Object.keys(newErrors).join(", ")}`);
      setUpdating(false);
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.email),
        { ...profile, isProfileComplete: true },
        { merge: true }
      );
      await setDoc(doc(db, "user_skills", user.email), { skills }, { merge: true });
      toast.success("Profile saved successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Save error:", error);
      toast.error("Save failed: An unexpected error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  const skillCategories = {
    hospitality: [
      "Hostess/Host",
      "Multilingual Guide",
      "Ticketing Officer",
      "Security",
      "Front Desk Officer",
      "Guest Service Representative",
      "Housekeeping Attendant",
      "Concierge",
      "Event Manager",
      "Event Coordinator",
      "Tour Guide",
      "Translator",
    ],
    officeWork: [
      "Customer Service Representative",
      "Data Entry Clerk",
      "Receptionist",
      "Office Assistant",
      "Bookkeeper",
      "Social Media Coordinator",
      "Content Writer",
      "Human Resource Assistant",
      "Accountant",
      "Recruiter",
      "Auditor",
    ],
    fAndB: [
      "Bartender",
      "Waitress/Waiter",
      "Bar Supervisor",
      "F&B Supervisor",
      "Commis",
      "Steward",
      "Front of House Attendant",
      "Sous Chef",
      "Chef de Partie",
      "Dishwasher",
    ],
    sales: ["Retail Staff", "Promoter", "Cashier", "Sales Representative"],
    beautyService: [
      "Hairdresser",
      "Makeup Artist",
      "Wardrobe Stylist",
      "Stylist",
      "Beauty Consultant",
      "Spa Therapist",
    ],
    entertainment: [
      "Model",
      "Singer",
      "Dancer",
      "Actor",
      "Musician",
      "Entertainer",
      "Photographer",
      "Videographer",
      "Magician",
      "Clown",
      "Event Staff",
      "Costume Character",
      "Stagehand",
      "Audio Visual Technician",
      "DJ",
      "MC",
      "Editor",
      "Production Assistant",
    ],
  };

  const cities = [
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Fujairah",
    "Ras Al Khaimah",
  ];

  const steps = [
    {
      title: "Personal Info",
      fields: ["firstName", "lastName", "dateOfBirth", "phoneNumber", "nationality"],
      icon: <FaUser />,
    },
    {
      title: "Location & Visa",
      fields: ["countryOfResidence", "city", "visaType"], // Renamed region to city
      icon: <FaMapMarkerAlt />,
    },
    { title: "Skills & Talents", fields: ["skills", "talents"], icon: <FaGlobe /> },
    {
      title: "Professional Details",
      fields: [
        "gender",
        "languagesSpoken",
        "whatsappNumber",
        "openToWorkIn",
        "hourlyRate",
        "highestEducation",
        "yearsOfExperience",
        "previousRelatedExperience",
        "availability",
        "experienceDescription",
        "secondNationality",
        "hasCarInUAE",
      ],
      icon: <FaIdCard />,
    },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (loading || !user) return <div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>;

  return (
    <>
      <Navbar />
      <section className="py-20 bg-[var(--primary)] min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-center mb-8"
          >
            <h1
              className="text-3xl font-bold font-heading flex items-center gap-2"
              style={{ color: "var(--white)", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
            >
              <FaUser /> {isEditMode ? "Edit Your Profile" : "Create Your Profile"}
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-[var(--accent)] hover:bg-[var(--teal-accent)]"
              style={{ color: "var(--white)" }}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </motion.div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, index) => (
                <div
                  key={index}
                  className={`text-sm flex items-center gap-1 ${
                    step >= index + 1 ? "text-[var(--color-accent)]" : "text-[var(--light)]"
                  }`}
                >
                  {s.icon} {s.title}
                </div>
              ))}
            </div>
            <div className="bg-[var(--soft)] h-3 rounded-full overflow-hidden">
              <div
                className="progress-bar h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] rounded-full transition-all duration-500"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="form-container p-8 rounded-2xl shadow-2xl border border-[var(--accent)]/30 bg-[var(--secondary)]/80 backdrop-blur-md"
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2 flex items-center gap-2"
                        style={{ color: "var(--light)" }}
                      >
                        <FaUser /> First Name*
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleInputChange}
                        className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                        required
                      />
                      {errors.firstName && (
                        <p
                          className="text-sm mt-1 flex items-center gap-1"
                          style={{ color: "var(--color-accent)" }}
                        >
                          <FaExclamationTriangle /> {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2 flex items-center gap-2"
                        style={{ color: "var(--light)" }}
                      >
                        <FaUser /> Last Name*
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleInputChange}
                        className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                        required
                      />
                      {errors.lastName && (
                        <p
                          className="text-sm mt-1 flex items-center gap-1"
                          style={{ color: "var(--color-accent)" }}
                        >
                          <FaExclamationTriangle /> {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaCalendar /> Date of Birth* (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    />
                    {errors.dateOfBirth && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaPhone /> Phone Number* (+971xxxxxxxxx)
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+971501234567"
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    />
                    {errors.phoneNumber && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGlobe /> Nationality*
                    </label>
                    <select
                      name="nationality"
                      value={profile.nationality}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    >
                      <option value="">Select Nationality</option>
                      <option value="UAE">UAE</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.nationality && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.nationality}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGlobeAmericas /> Country of Residence*
                    </label>
                    <input
                      type="text"
                      name="countryOfResidence"
                      value={profile.countryOfResidence}
                      disabled
                      className="neumorphic-input w-full opacity-50 border border-[var(--light)]/50"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaMapMarkerAlt /> City*
                    </label>
                    <select
                      name="city"
                      value={profile.city}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaIdCard /> Visa Type*
                    </label>
                    <select
                      name="visaType"
                      value={profile.visaType}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    >
                      <option value="">Select Visa Type</option>
                      <option value="employment">Employment</option>
                      <option value="family">Family</option>
                      <option value="freelance">Freelance</option>
                      <option value="golden">Golden</option>
                      <option value="investor">Investor</option>
                      <option value="sponsor_of_war">Sponsor of War</option>
                      <option value="student">Student</option>
                    </select>
                    {errors.visaType && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.visaType}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGlobe /> What are you good at? (Select all that apply)*
                    </label>
                    {Object.entries(skillCategories).map(([category, options]) => (
                      <div key={category} className="mb-6">
                        <div
                          className="collapsible-header flex justify-between items-center p-4 rounded-xl mb-2 cursor-pointer transition-all duration-300 hover:bg-[var(--accent)]/50"
                          onClick={() => toggleCategory(category)}
                          style={{ backgroundColor: "var(--soft)", color: "var(--accent)" }}
                        >
                          <span className="font-semibold">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: openCategories.includes(category) ? "&minus;" : "&plus;" }} />
                        </div>
                        {openCategories.includes(category) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mt-2 flex flex-wrap gap-2 p-4 bg-[var(--soft)] rounded-xl"
                          >
                            {options.map((skill) => {
                              const skillId = `${category}_${skill.toLowerCase().replace(/ /g, "_")}`;
                              return (
                                <motion.div
                                  key={skillId}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`skill-tag px-4 py-2 rounded-full font-medium transition-all duration-300 cursor-pointer ${
                                    skills.includes(skillId)
                                      ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)] shadow-md"
                                      : "bg-[var(--accent)] text-[var(--white)] hover:bg-[var(--color-accent)] hover:text-[var(--primary)]"
                                  }`}
                                  onClick={() => toggleSkill(skillId)}
                                >
                                  {skill}
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaStar /> Talents (Select all that apply)
                    </label>
                    <motion.div className="flex flex-wrap gap-2 p-4 bg-[var(--soft)] rounded-xl">
                      {[
                        "Public Speaking",
                        "Event Planning",
                        "Photography",
                        "Videography",
                        "Music Production",
                        "Graphic Design",
                      ].map((talent) => (
                        <motion.div
                          key={talent}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`skill-tag px-4 py-2 rounded-full font-medium transition-all duration-300 cursor-pointer ${
                            profile.talents.includes(talent)
                              ? "bg-gradient-to-r from-[var(--color-accent)] to-[var(--teal-accent)] text-[var(--primary)] shadow-md"
                              : "bg-[var(--accent)] text-[var(--white)] hover:bg-[var(--color-accent)] hover:text-[var(--primary)]"
                          }`}
                          onClick={() =>
                            handleMultiSelectChange(
                              "talents",
                              profile.talents.includes(talent)
                                ? profile.talents.filter((t) => t !== talent)
                                : [...profile.talents, talent]
                            )
                          }
                        >
                          {talent}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaVenusMars /> Gender*
                    </label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.gender}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGlobe /> Languages Spoken*
                    </label>
                    <select
                      multiple
                      name="languagesSpoken"
                      value={profile.languagesSpoken}
                      onChange={(e) =>
                        handleMultiSelectChange(
                          "languagesSpoken",
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      size={3}
                    >
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Hindi">Hindi</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaPhone /> WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={profile.whatsappNumber}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaMapMarkerAlt /> Open to Work In*
                    </label>
                    <select
                      multiple
                      name="openToWorkIn"
                      value={profile.openToWorkIn}
                      onChange={(e) =>
                        handleMultiSelectChange(
                          "openToWorkIn",
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      size={2}
                    >
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaMoneyBillWave /> Average Rate Per Hour (AED)*
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={profile.hourlyRate}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    />
                    {errors.hourlyRate && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.hourlyRate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGraduationCap /> Highest Education
                    </label>
                    <select
                      name="highestEducation"
                      value={profile.highestEducation}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                    >
                      <option value="">Select Education</option>
                      <option value="High School">High School</option>
                      <option value="Bachelor&apos;s">Bachelor&apos;s</option>
                      <option value="Master&apos;s">Master&apos;s</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaClock /> Years of Experience*
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={profile.yearsOfExperience}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      required
                    />
                    {errors.yearsOfExperience && (
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <FaExclamationTriangle /> {errors.yearsOfExperience}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGlobe /> Previous Related Experience
                    </label>
                    <textarea
                      name="previousRelatedExperience"
                      value={profile.previousRelatedExperience}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaClock /> Availability
                    </label>
                    <input
                      type="text"
                      name="availability"
                      value={profile.availability}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2 flex items-center gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <FaGlobe /> Second Nationality
                    </label>
                    <select
                      name="secondNationality"
                      value={profile.secondNationality}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full border border-[var(--light)]/50 focus:border-[var(--color-accent)] transition-colors duration-300"
                    >
                      <option value="">None</option>
                      <option value="UAE">UAE</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="flex items-center text-sm font-medium mb-2 gap-2"
                      style={{ color: "var(--light)" }}
                    >
                      <input
                        type="checkbox"
                        name="hasCarInUAE"
                        checked={profile.hasCarInUAE}
                        onChange={(e) => setProfile({ ...profile, hasCarInUAE: e.target.checked })}
                        className="mr-2 rounded"
                      />
                      <FaCar /> Car in UAE
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--accent)",
                    color: "var(--white)",
                    border: "1px solid var(--light)",
                  }}
                >
                  Previous
                </button>
              )}
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--color-accent), var(--teal-accent))",
                    color: "var(--primary)",
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={updating || Object.keys(errors).length > 0}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    updating || Object.keys(errors).length > 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                  style={{
                    background:
                      updating || Object.keys(errors).length > 0
                        ? "var(--soft)"
                        : "linear-gradient(135deg, var(--color-accent), var(--teal-accent))",
                    color:
                      updating || Object.keys(errors).length > 0
                        ? "var(--accent)"
                        : "var(--primary)",
                  }}
                >
                  {updating ? "Saving..." : "Save Profile"}
                </button>
              )}
            </div>
          </motion.form>
        </div>
      </section>
    </>
  );
}

// Default export: Wrap the child in Suspense
export default function Profile() {
  return (
    <Suspense fallback={<div className="py-20 text-center flex items-center justify-center min-h-screen" style={{ color: "var(--white)" }}>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
