
"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "react-toastify";
import {
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
  FaImage,
  FaFileAlt,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

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

const containerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.2 } },
};

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
    profileImageUrl: "",
    resumeUrl: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      console.log("Redirecting to homepage: user is null, loading: " + loading);
      router.push("/");
      return;
    }
    if (user) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const skillsDoc = await getDoc(doc(db, "user_skills", user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            console.log("Fetched profile data from Firestore: ", profileData);
            setProfile((prev) => ({ ...prev, ...profileData }));
            setIsProfileLoaded(true);
          } else {
            console.log("No profile data found in Firestore for user: " + user.uid);
            setIsProfileLoaded(true);
          }
          if (skillsDoc.exists()) {
            const skillsData = skillsDoc.data().skills || [];
            console.log("Fetched skills data from Firestore: ", skillsData);
            setSkills(skillsData);
          } else {
            console.log("No skills data found in Firestore for user: " + user.uid);
          }
        } catch (error: unknown) {
          console.error("Fetch profile error: ", error instanceof Error ? error.message : error);
          toast.error("Error fetching profile. Please try again.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
        }
      };
      fetchProfile();
    }
  }, [user, loading, router, isEditMode]);

  const validateField = (name: string, value: string | string[] | boolean | number) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
      case "nationality":
      case "city":
      case "visaType":
      case "gender":
      case "hourlyRate":
      case "yearsOfExperience":
        if (typeof value === "string" && !value) error = name.replace(/([A-Z])/g, " $1").trim() + " is required";
        break;
      case "dateOfBirth":
        if (typeof value === "string" && !value) error = "Date of Birth is required";
        break;
      case "phoneNumber":
        if (typeof value === "string") {
          if (!value) error = "Phone Number is required";
          else if (!/^\+971\d{9}$/.test(value)) error = "Phone must be +971xxxxxxxxx (no spaces, e.g., +971501234567)";
        }
        break;
      case "languagesSpoken":
      case "openToWorkIn":
      case "talents":
        if (Array.isArray(value) && value.length === 0) error = name.replace(/([A-Z])/g, " $1").trim() + " cannot be empty";
        break;
      case "skills":
        if (Array.isArray(value) && value.length === 0) error = "Please select at least one skill";
        break;
      case "hourlyRate":
      case "yearsOfExperience":
        if (typeof value === "string" && value && (isNaN(Number(value)) || Number(value) <= 0)) error = name.replace(/([A-Z])/g, " $1").trim() + " must be > 0 (e.g., 50)";
        break;
      default:
        break;
    }
    return error;
  };

  const validateStep = (currentStep: number) => {
    const stepFields = steps[currentStep - 1].fields;
    const newErrors: Record<string, string> = {};
    stepFields.forEach((field) => {
      if (field === "skills") {
        const error = validateField(field, skills);
        if (error) newErrors[field] = error;
      } else {
        const value = profile[field as keyof typeof profile];
        const error = validateField(field, value);
        if (error) newErrors[field] = error;
      }
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error("Please fix the errors before proceeding.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("Input changed: " + name + " = " + value);
    setProfile({ ...profile, [name]: value });
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleMultiSelectChange = (name: string, values: string[]) => {
    console.log("Multi-select changed: " + name + " = ", values);
    setProfile({ ...profile, [name]: values });
    const error = validateField(name, values);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const toggleSkill = (skill: string) => {
    console.log("Toggling skill: " + skill);
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    const error = validateField("skills", skills);
    setErrors((prev) => ({ ...prev, skills: error }));
  };

  const toggleCategory = (category: string) => {
    console.log("Toggling category: " + category);
    setOpenCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleFileUpload = async (file: File | null, type: "image" | "resume") => {
    if (!file) {
      console.log("No " + type + " file selected for upload");
      toast.error("Please select a file to upload.", { className: "bg-[var(--primary)] text-[var(--text-body)]" });
      return;
    }

    if (file.size > 200 * 1024) {
      console.log(type + " file too large: " + file.name + ", size: " + file.size + " bytes");
      toast.error(
        (type === "image" ? "Profile image" : "Resume") + " is too large (" + (file.size / 1024 / 1024).toFixed(2) + "MB). Must be under 200KB."
      );
      return;
    }

    try {
      console.log("Uploading " + type + " to Cloudinary: " + file.name);
      setUploadingImage(type === "image" ? true : uploadingImage);
      setUploadingResume(type === "resume" ? true : uploadingResume);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "eventopic_unsigned");
      formData.append("folder", "eventopic");
      formData.append("api_key", "381131836444186");
      formData.append("resource_type", type === "image" ? "image" : "raw");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/" + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + "/" + (type === "image" ? "image" : "raw") + "/upload",
        formData
      );

      const url = response.data.secure_url;
      console.log(type + " uploaded successfully, URL: " + url);
      setProfile((prev) => {
        const updatedProfile = { ...prev, [type === "image" ? "profileImageUrl" : "resumeUrl"]: url };
        console.log("Updated profile state with " + type + " URL: ", updatedProfile);
        return updatedProfile;
      });
      toast.success((type === "image" ? "Profile image" : "Resume") + " uploaded successfully!");
    } catch (error: unknown) {
      console.error("Error uploading " + type + ": ", error instanceof Error ? error.message : error);
      toast.error(
        error instanceof Error
          ? error.message || "Failed to upload " + (type === "image" ? "profile image" : "resume") + ". Please try again."
          : "Failed to upload " + (type === "image" ? "profile image" : "resume") + ". Please try again."
      );
    } finally {
      setUploadingImage(type === "image" ? false : uploadingImage);
      setUploadingResume(type === "resume" ? false : uploadingResume);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.uid) {
      console.log("Submit attempted without valid user");
      toast.error("Please sign in with a valid account.");
      setUpdating(false);
      return;
    }

    setUpdating(true);

    const newErrors: Record<string, string> = {};
    steps.flatMap((step) => step.fields).forEach((field) => {
      if (field === "skills") {
        const error = validateField(field, skills);
        if (error) newErrors[field] = error;
      } else {
        const value = profile[field as keyof typeof profile];
        const error = validateField(field, value);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log("Form validation errors: ", newErrors);
      toast.error("Please fix: " + Object.keys(newErrors).map((key) => key.replace(/([A-Z])/g, " $1").trim()).join(", "));
      setUpdating(false);
      return;
    }

    try {
      console.log("Saving profile to Firestore: ", profile);
      await setDoc(
        doc(db, "users", user.uid),
        { ...profile, isProfileComplete: true },
        { merge: true }
      );
      console.log("Profile saved to Firestore for user: " + user.uid);
      await setDoc(doc(db, "user_skills", user.uid), { skills }, { merge: true });
      console.log("Skills saved to Firestore: ", skills);
      toast.success("Profile saved successfully!");
      router.push("/profile");
    } catch (error: unknown) {
      console.error("Save profile error: ", error instanceof Error ? error.message : error);
      toast.error("Failed to save profile. Please try again.");
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
      fields: ["countryOfResidence", "city", "visaType"],
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
        "profileImageUrl",
        "resumeUrl",
      ],
      icon: <FaIdCard />,
    },
  ];

  const niceSkills = skills.map((skill) =>
    skill
      .split("_")
      .slice(1)
      .join(" ")
      .replace(/\//g, "/")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

  if (loading || !user || !isProfileLoaded)
    return (
      <div
        className="pt-20 text-center flex items-center justify-center min-h-screen"
        style={{ color: "var(--text-body)" }}
      >
        Loading...
      </div>
    );

  console.log("Rendering profile view - profileImageUrl: " + profile.profileImageUrl);
  console.log("Rendering profile view - resumeUrl: " + profile.resumeUrl);

  return (
    <>
      <Navbar />
      <section className="pt-20 bg-[var(--primary)] min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1
              className="text-4xl font-bold font-heading flex items-center gap-2"
              style={{ color: "var(--text-accent)", textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
              aria-label={profile.isProfileComplete && !isEditMode ? "Your Profile" : isEditMode ? "Edit Your Profile" : "Create Your Profile"}
            >
              <FaUser /> {profile.isProfileComplete && !isEditMode ? "Your Profile" : isEditMode ? "Edit Your Profile" : "Create Your Profile"}
            </h1>
          </motion.div>

          {(!profile.isProfileComplete || isEditMode) ? (
            <>
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {steps.map((s, index) => (
                    <div
                      key={index}
                      className={`text-sm flex items-center gap-1 ${step >= index + 1 ? "text-[var(--text-accent)]" : "text-[var(--text-body)]"} font-semibold`}
                    >
                      {s.icon} {s.title}
                    </div>
                  ))}
                </div>
                <div className="bg-[var(--primary)]/50 h-3 rounded-full overflow-hidden border border-[var(--light)]/20">
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
                className="p-8 rounded-2xl shadow-lg border border-[var(--light)]/20 bg-[var(--primary)]/50 backdrop-blur-md"
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
                            htmlFor="firstName"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaUser /> First Name*
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                            required
                            aria-describedby={errors.firstName ? "firstName-error" : undefined}
                          />
                          {errors.firstName && (
                            <p
                              id="firstName-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaUser /> Last Name*
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                            required
                            aria-describedby={errors.lastName ? "lastName-error" : undefined}
                          />
                          {errors.lastName && (
                            <p
                              id="lastName-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="dateOfBirth"
                          className="block text-sm font-medium mb-2 flex items-center gap-2"
                          style={{ color: "var(--text-body)" }}
                        >
                          <FaCalendar /> Date of Birth* (YYYY-MM-DD)
                        </label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={profile.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                          required
                          aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                        />
                        {errors.dateOfBirth && (
                          <p
                            id="dateOfBirth-error"
                            className="text-sm mt-1 flex items-center gap-1"
                            style={{ color: "var(--error)" }}
                          >
                            <FaExclamationTriangle /> {errors.dateOfBirth}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaPhone /> Phone Number* (+971xxxxxxxxx)
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profile.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="+971501234567"
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                            required
                            aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                          />
                          {errors.phoneNumber && (
                            <p
                              id="phoneNumber-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="nationality"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGlobe /> Nationality*
                          </label>
                          <select
                            id="nationality"
                            name="nationality"
                            value={profile.nationality}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                            required
                            aria-describedby={errors.nationality ? "nationality-error" : undefined}
                          >
                            <option value="">Select Nationality</option>
                            <option value="UAE">UAE</option>
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.nationality && (
                            <p
                              id="nationality-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
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
                            htmlFor="countryOfResidence"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGlobeAmericas /> Country of Residence*
                          </label>
                          <input
                            type="text"
                            id="countryOfResidence"
                            name="countryOfResidence"
                            value={profile.countryOfResidence}
                            disabled
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 opacity-50 text-[var(--text-body)]"
                            aria-describedby="countryOfResidence-info"
                          />
                          <p
                            id="countryOfResidence-info"
                            className="text-sm mt-1"
                            style={{ color: "var(--text-body)" }}
                          >
                            Fixed to UAE for this platform.
                          </p>
                        </div>
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaMapMarkerAlt /> City*
                          </label>
                          <select
                            id="city"
                            name="city"
                            value={profile.city}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.city ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            required
                            aria-required="true"
                            aria-describedby={errors.city ? "city-error" : undefined}
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
                              id="city-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="visaType"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaIdCard /> Visa Type*
                          </label>
                          <select
                            id="visaType"
                            name="visaType"
                            value={profile.visaType}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.visaType ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            required
                            aria-required="true"
                            aria-describedby={errors.visaType ? "visaType-error" : undefined}
                          >
                            <option value="">Select Visa Type</option>
                            <option value="employment">Employment</option>
                            <option value="family">Family</option>
                            <option value="freelance">Freelance</option>
                            <option value="golden">Golden</option>
                            <option value="investor">Investor</option>
                            <option value="student">Student</option>
                          </select>
                          {errors.visaType && (
                            <p
                              id="visaType-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
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
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGlobe /> What are you good at? (Select all that apply)*
                          </label>
                          {Object.entries(skillCategories).map(([category, options]) => (
                            <div key={category} className="mb-6">
                              <div
                                className="flex justify-between items-center p-4 rounded-xl mb-2 cursor-pointer transition-all duration-300 hover:bg-[var(--color-accent)]/30"
                                onClick={() => toggleCategory(category)}
                                style={{ backgroundColor: "var(--primary)/50", color: "var(--text-accent)" }}
                                role="button"
                                aria-expanded={openCategories.includes(category)}
                                aria-controls={`skills-${category}`}
                              >
                                <span className="font-semibold">
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: openCategories.includes(category) ? "&minus;" : "&plus;" }} />
                              </div>
                              {openCategories.includes(category) && (
                                <motion.div
                                  id={`skills-${category}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-2 flex flex-wrap gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                                >
                                  {options.map((skill) => {
                                    const skillId = `${category}_${skill.toLowerCase().replace(/ /g, "_")}`;
                                    return (
                                      <motion.div
                                        key={skillId}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 cursor-pointer ${
                                          skills.includes(skillId)
                                            ? "bg-[var(--color-accent)] text-[var(--white)] shadow-md"
                                            : "bg-[var(--primary)]/50 text-[var(--text-body)] hover:bg-[var(--color-accent)] hover:text-[var(--white)]"
                                        }`}
                                        onClick={() => toggleSkill(skillId)}
                                        role="checkbox"
                                        aria-checked={skills.includes(skillId)}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleSkill(skillId);
                                          }
                                        }}
                                      >
                                        {skill}
                                      </motion.div>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </div>
                          ))}
                          {errors.skills && (
                            <p
                              id="skills-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.skills}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaStar /> Talents (Select at least one)*
                          </label>
                          <motion.div className="flex flex-wrap gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20">
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
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 cursor-pointer ${
                                  profile.talents.includes(talent)
                                    ? "bg-[var(--color-accent)] text-[var(--white)] shadow-md"
                                    : "bg-[var(--primary)]/50 text-[var(--text-body)] hover:bg-[var(--color-accent)] hover:text-[var(--white)]"
                                }`}
                                onClick={() =>
                                  handleMultiSelectChange(
                                    "talents",
                                    profile.talents.includes(talent)
                                      ? profile.talents.filter((t) => t !== talent)
                                      : [...profile.talents, talent]
                                  )
                                }
                                role="checkbox"
                                aria-checked={profile.talents.includes(talent)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleMultiSelectChange(
                                      "talents",
                                      profile.talents.includes(talent)
                                        ? profile.talents.filter((t) => t !== talent)
                                        : [...profile.talents, talent]
                                    );
                                  }
                                }}
                              >
                                {talent}
                              </motion.div>
                            ))}
                          </motion.div>
                          {errors.talents && (
                            <p
                              id="talents-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.talents}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-8"
                      >
                        <div>
                          <label
                            htmlFor="gender"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaVenusMars /> Gender*
                          </label>
                          <select
                            id="gender"
                            name="gender"
                            value={profile.gender}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.gender ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            required
                            aria-describedby={errors.gender ? "gender-error" : undefined}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.gender && (
                            <p
                              id="gender-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.gender}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="languagesSpoken"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGlobe /> Languages Spoken*
                          </label>
                          <select
                            id="languagesSpoken"
                            multiple
                            name="languagesSpoken"
                            value={profile.languagesSpoken}
                            onChange={(e) =>
                              handleMultiSelectChange(
                                "languagesSpoken",
                                Array.from(e.target.selectedOptions, (option) => option.value)
                              )
                            }
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.languagesSpoken ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            size={3}
                            aria-describedby={errors.languagesSpoken ? "languagesSpoken-error" : undefined}
                          >
                            <option value="English">English</option>
                            <option value="Arabic">Arabic</option>
                            <option value="Hindi">Hindi</option>
                            <option value="French">French</option>
                          </select>
                          {errors.languagesSpoken && (
                            <p
                              id="languagesSpoken-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.languagesSpoken}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="whatsappNumber"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaPhone /> WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            id="whatsappNumber"
                            name="whatsappNumber"
                            value={profile.whatsappNumber}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="openToWorkIn"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaMapMarkerAlt /> Open to Work In*
                          </label>
                          <select
                            id="openToWorkIn"
                            multiple
                            name="openToWorkIn"
                            value={profile.openToWorkIn}
                            onChange={(e) =>
                              handleMultiSelectChange(
                                "openToWorkIn",
                                Array.from(e.target.selectedOptions, (option) => option.value)
                              )
                            }
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.openToWorkIn ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            size={2}
                            aria-describedby={errors.openToWorkIn ? "openToWorkIn-error" : undefined}
                          >
                            <option value="UAE">UAE</option>
                          </select>
                          {errors.openToWorkIn && (
                            <p
                              id="openToWorkIn-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.openToWorkIn}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="hourlyRate"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaMoneyBillWave /> Average Rate Per Hour (AED)*
                          </label>
                          <input
                            type="number"
                            id="hourlyRate"
                            name="hourlyRate"
                            value={profile.hourlyRate}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.hourlyRate ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            required
                            aria-describedby={errors.hourlyRate ? "hourlyRate-error" : undefined}
                          />
                          {errors.hourlyRate && (
                            <p
                              id="hourlyRate-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.hourlyRate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="highestEducation"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGraduationCap /> Highest Education
                          </label>
                          <select
                            id="highestEducation"
                            name="highestEducation"
                            value={profile.highestEducation}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                          >
                            <option value="">Select Education</option>
                            <option value="High School">High School</option>
                            <option value="Bachelor&apos;s">Bachelor&apos;s</option>
                            <option value="Master&apos;s">Master&apos;s</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="yearsOfExperience"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaClock /> Years of Experience*
                          </label>
                          <input
                            type="number"
                            id="yearsOfExperience"
                            name="yearsOfExperience"
                            value={profile.yearsOfExperience}
                            onChange={handleInputChange}
                            className={`w-full p-3 rounded-lg bg-[var(--primary)]/50 border ${errors.yearsOfExperience ? "border-[var(--error)]" : "border-[var(--light)]/20"} focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]`}
                            required
                            aria-describedby={errors.yearsOfExperience ? "yearsOfExperience-error" : undefined}
                          />
                          {errors.yearsOfExperience && (
                            <p
                              id="yearsOfExperience-error"
                              className="text-sm mt-1 flex items-center gap-1"
                              style={{ color: "var(--error)" }}
                            >
                              <FaExclamationTriangle /> {errors.yearsOfExperience}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="previousRelatedExperience"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGlobe /> Previous Related Experience
                          </label>
                          <textarea
                            id="previousRelatedExperience"
                            name="previousRelatedExperience"
                            value={profile.previousRelatedExperience}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                            rows={4}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="availability"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaClock /> Availability
                          </label>
                          <input
                            type="text"
                            id="availability"
                            name="availability"
                            value={profile.availability}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="secondNationality"
                            className="block text-sm font-medium mb-2 flex items-center gap-2"
                            style={{ color: "var(--text-body)" }}
                          >
                            <FaGlobe /> Second Nationality
                          </label>
                          <select
                            id="secondNationality"
                            name="secondNationality"
                            value={profile.secondNationality}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[var(--primary)]/50 border border-[var(--light)]/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors duration-300 text-[var(--text-body)]"
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
                            style={{ color: "var(--text-body)" }}
                          >
                            <input
                              type="checkbox"
                              name="hasCarInUAE"
                              checked={profile.hasCarInUAE}
                              onChange={(e) => {
                                console.log("hasCarInUAE changed: " + e.target.checked);
                                setProfile({ ...profile, hasCarInUAE: e.target.checked });
                                validateField("hasCarInUAE", e.target.checked);
                              }}
                              className="mr-2 rounded"
                            />
                            <FaCar /> Car in UAE
                          </label>
                        </div>
                        <motion.div
                          className="p-8 rounded-2xl border-2 border-[var(--light)]/20 bg-[var(--primary)]/50 backdrop-blur-md shadow-lg group"
                          whileHover={{ scale: 1.03, y: -10, boxShadow: "0 0 15px rgba(0, 196, 180, 0.3)" }}
                          transition={{ duration: 0.3 }}
                        >
                          <label
                            className="block text-lg font-bold mb-4 flex items-center gap-3"
                            style={{ color: "var(--text-accent)" }}
                          >
                            <FaImage size={24} /> Profile Image
                          </label>
                          {profile.profileImageUrl ? (
                            <div className="flex flex-col items-start">
                              <Image
                                src={profile.profileImageUrl || "/placeholder.png"}
                                alt="Profile Preview"
                                width={192}
                                height={192}
                                className="rounded-full object-cover mb-4 border-2 border-[var(--color-accent)] shadow-md aspect-[1/1]"
                                quality={85}
                              />
                              <motion.button
                                variants={buttonVariants}
                                onClick={() => {
                                  console.log("Removing profile image, current URL: " + profile.profileImageUrl);
                                  setProfile({ ...profile, profileImageUrl: "" });
                                }}
                                className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                              >
                                Remove Image
                                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                              </motion.button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start">
                              <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  console.log("Profile image selected: " + file?.name + ", " + file?.size);
                                  setProfileImage(file);
                                }}
                                className="mb-4 text-base text-[var(--text-body)] bg-[var(--primary)]/50 p-4 rounded-lg border border-[var(--light)]/20 focus:border-[var(--color-accent)] w-full cursor-pointer"
                              />
                              {profileImage && (
                                <p className="text-base mb-4 font-medium" style={{ color: "var(--text-body)" }}>
                                  Selected: {profileImage.name} ({(profileImage.size / 1024).toFixed(2)}KB)
                                </p>
                              )}
                              <motion.button
                                variants={buttonVariants}
                                onClick={() => handleFileUpload(profileImage, "image")}
                                disabled={!profileImage || uploadingImage}
                                className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 group relative"
                                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                              >
                                {uploadingImage ? (
                                  <>
                                    <FaSpinner className="animate-spin" size={20} /> Uploading...
                                  </>
                                ) : (
                                  "Upload Profile Image"
                                )}
                                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                              </motion.button>
                              <p className="text-sm mt-3 font-body" style={{ color: "var(--text-body)" }}>
                                Max size: 200KB (PNG, JPEG)
                              </p>
                            </div>
                          )}
                        </motion.div>
                        <motion.div
                          className="p-8 rounded-2xl border-2 border-[var(--light)]/20 bg-[var(--primary)]/50 backdrop-blur-md shadow-lg group"
                          whileHover={{ scale: 1.03, y: -10, boxShadow: "0 0 15px rgba(0, 196, 180, 0.3)" }}
                          transition={{ duration: 0.3 }}
                        >
                          <label
                            className="block text-lg font-bold mb-4 flex items-center gap-3"
                            style={{ color: "var(--text-accent)" }}
                          >
                            <FaFileAlt size={24} /> Resume
                          </label>
                          {profile.resumeUrl ? (
                            <div className="flex flex-col items-start">
                              <p className="text-base mb-4 font-medium" style={{ color: "var(--text-body)" }}>
                                Resume uploaded. Click to download.
                              </p>
                              <motion.button
                                variants={buttonVariants}
                                onClick={() => {
                                  console.log("Downloading resume, URL: " + profile.resumeUrl);
                                  const link = document.createElement("a");
                                  link.href = profile.resumeUrl!;
                                  link.download = "resume";
                                  link.click();
                                }}
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                              >
                                <FaDownload /> Download Resume
                                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                              </motion.button>
                              <motion.button
                                variants={buttonVariants}
                                onClick={() => {
                                  console.log("Removing resume, current URL: " + profile.resumeUrl);
                                  setProfile({ ...profile, resumeUrl: "" });
                                }}
                                className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 mt-4 group relative"
                                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                              >
                                Remove Resume
                                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                              </motion.button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start">
                              <input
                                type="file"
                                id="resume"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  console.log("Resume selected: " + file?.name + ", " + file?.size);
                                  setResume(file);
                                }}
                                className="mb-4 text-base text-[var(--text-body)] bg-[var(--primary)]/50 p-4 rounded-lg border border-[var(--light)]/20 focus:border-[var(--color-accent)] w-full cursor-pointer"
                              />
                              {resume && (
                                <p className="text-base mb-4 font-medium" style={{ color: "var(--text-body)" }}>
                                  Selected: {resume.name} ({(resume.size / 1024).toFixed(2)}KB)
                                </p>
                              )}
                              <motion.button
                                variants={buttonVariants}
                                onClick={() => handleFileUpload(resume, "resume")}
                                disabled={!resume || uploadingResume}
                                className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 group relative"
                                style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                              >
                                {uploadingResume ? (
                                  <>
                                    <FaSpinner className="animate-spin" size={20} /> Uploading...
                                  </>
                                ) : (
                                  "Upload Resume"
                                )}
                                <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                              </motion.button>
                              <p className="text-sm mt-3 font-body" style={{ color: "var(--text-body)" }}>
                                Max size: 200KB (PDF, DOC, DOCX)
                              </p>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div className="flex justify-between mt-8" variants={containerVariants} initial="hidden" animate="visible">
                    {step > 1 && (
                      <motion.button
                        variants={buttonVariants}
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                        style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                      >
                        Previous
                        <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                      </motion.button>
                    )}
                    {step < steps.length ? (
                      <motion.button
                        variants={buttonVariants}
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                        style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                      >
                        Next
                        <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                      </motion.button>
                    ) : (
                      <motion.button
                        variants={buttonVariants}
                        type="submit"
                        disabled={updating || Object.keys(errors).length > 0}
                        className="px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 group relative"
                        style={{
                          backgroundColor: updating || Object.keys(errors).length > 0
                            ? "var(--primary)/50"
                            : "var(--accent)",
                          color: updating || Object.keys(errors).length > 0 ? "var(--text-body)" : "var(--white)",
                          border: "2px solid var(--light)"
                        }}
                      >
                        {updating ? "Saving..." : "Save Profile"}
                        <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                      </motion.button>
                    )}
                  </motion.div>
                </motion.form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="p-8 rounded-2xl shadow-lg border border-[var(--light)]/20 bg-[var(--primary)]/50 backdrop-blur-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <div className="mb-8">
                      <h2
                        className="text-xl font-semibold mb-4 font-heading flex items-center gap-2"
                        style={{ color: "var(--text-accent)" }}
                      >
                        <FaImage /> Profile Image
                      </h2>
                      {profile.profileImageUrl ? (
                        <div className="flex flex-col items-center">
                          <Image
                            src={profile.profileImageUrl || "/placeholder.png"}
                            alt="Profile"
                            width={256}
                            height={256}
                            className="rounded-full object-cover mb-4 border-2 border-[var(--color-accent)] aspect-[1/1]"
                            quality={85}
                          />
                          <motion.button
                            variants={buttonVariants}
                            onClick={() => {
                              console.log("Downloading profile image, URL: " + profile.profileImageUrl);
                              const link = document.createElement("a");
                              link.href = profile.profileImageUrl!;
                              link.download = "profile-image";
                              link.click();
                            }}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                            style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                          >
                            <FaDownload /> Download Profile Image
                            <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                          </motion.button>
                        </div>
                      ) : (
                        <p className="text-sm font-body" style={{ color: "var(--text-body)" }}>
                          No profile image uploaded.
                        </p>
                      )}
                    </div>
                    <div>
                      <h2
                        className="text-xl font-semibold mb-4 font-heading flex items-center gap-2"
                        style={{ color: "var(--text-accent)" }}
                      >
                        <FaFileAlt /> Resume
                      </h2>
                      {profile.resumeUrl ? (
                        <div className="flex flex-col items-center">
                          <p className="text-sm mb-4" style={{ color: "var(--text-body)" }}>
                            Resume uploaded. Click to download.
                          </p>
                          <motion.button
                            variants={buttonVariants}
                            onClick={() => {
                              console.log("Downloading resume, URL: " + profile.resumeUrl);
                              const link = document.createElement("a");
                              link.href = profile.resumeUrl!;
                              link.download = "resume";
                              link.click();
                            }}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-lg font-bold font-body shadow-xl hover:shadow-2xl transition-all duration-300 group relative"
                            style={{ backgroundColor: "var(--accent)", color: "var(--white)", border: "2px solid var(--light)" }}
                          >
                            <FaDownload /> Download Resume
                            <span className="absolute inset-0 bg-[var(--teal-accent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full -z-10"></span>
                          </motion.button>
                        </div>
                      ) : (
                        <p className="text-sm font-body" style={{ color: "var(--text-body)" }}>
                          No resume uploaded.
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2"
                      style={{ color: "var(--text-accent)" }}
                    >
                      <FaUser /> Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaUser className="text-[var(--text-accent)]" /> <strong>Name:</strong>{" "}
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaCalendar className="text-[var(--text-accent)]" /> <strong>Date of Birth:</strong>{" "}
                          {profile.dateOfBirth || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaPhone className="text-[var(--text-accent)]" /> <strong>Phone Number:</strong>{" "}
                          {profile.phoneNumber || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaPhone className="text-[var(--text-accent)]" /> <strong>WhatsApp Number:</strong>{" "}
                          {profile.whatsappNumber || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaGlobe className="text-[var(--text-accent)]" /> <strong>Nationality:</strong>{" "}
                          {profile.nationality || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaGlobe className="text-[var(--text-accent)]" /> <strong>Second Nationality:</strong>{" "}
                          {profile.secondNationality || "None"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaVenusMars className="text-[var(--text-accent)]" /> <strong>Gender:</strong>{" "}
                          {profile.gender || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaMapMarkerAlt className="text-[var(--text-accent)]" /> <strong>Location:</strong>{" "}
                          {profile.city}, {profile.countryOfResidence}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaIdCard className="text-[var(--text-accent)]" /> <strong>Visa Type:</strong>{" "}
                          {profile.visaType || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaGlobe className="text-[var(--text-accent)]" /> <strong>Languages:</strong>{" "}
                          {profile.languagesSpoken.length > 0 ? profile.languagesSpoken.join(", ") : "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaMapMarkerAlt className="text-[var(--text-accent)]" /> <strong>Open to Work In:</strong>{" "}
                          {profile.openToWorkIn.length > 0 ? profile.openToWorkIn.join(", ") : "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaMoneyBillWave className="text-[var(--text-accent)]" /> <strong>Hourly Rate (AED):</strong>{" "}
                          {profile.hourlyRate || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaGraduationCap className="text-[var(--text-accent)]" /> <strong>Education:</strong>{" "}
                          {profile.highestEducation || "Not set"}
                        </p>
                        <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                          <FaCar className="text-[var(--text-accent)]" /> <strong>Car in UAE:</strong>{" "}
                          {profile.hasCarInUAE ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    <h2
                      className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2"
                      style={{ color: "var(--text-accent)" }}
                    >
                      <FaStar /> Your Skills & Experience
                    </h2>
                    <div className="bg-[var(--primary)]/50 p-6 rounded-xl border border-[var(--light)]/20 mb-6">
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-accent)] scrollbar-track-[var(--primary)]">
                        {niceSkills.length > 0 ? (
                          niceSkills.map((skill, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-body font-medium bg-[var(--color-accent)] text-[var(--white)] hover:bg-[var(--teal-accent)] transition-all duration-200"
                              aria-label={`Skill: ${skill}`}
                            >
                              <FaStar className="text-xs" /> {skill}
                            </motion.span>
                          ))
                        ) : (
                          <p className="text-sm font-body" style={{ color: "var(--text-body)" }}>
                            No skills added yet.
                          </p>
                        )}
                      </div>
                    </div>

                  <div className="space-y-4">
                    <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                      <FaClock className="text-[var(--text-accent)]" /> <strong>Years of Experience:</strong>{" "}
                      {profile.yearsOfExperience || "Not set"}
                    </p>
                    <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                      <FaClock className="text-[var(--text-accent)]" /> <strong>Availability:</strong>{" "}
                      {profile.availability || "Not set"}
                    </p>
                    <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                      <FaStar className="text-[var(--text-accent)]" /> <strong>Talents:</strong>{" "}
                      {profile.talents.length > 0 ? profile.talents.join(", ") : "Not set"}
                    </p>
                    <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                      <FaGlobe className="text-[var(--text-accent)]" /> <strong>Previous Experience:</strong>{" "}
                      {profile.previousRelatedExperience || "Not set"}
                    </p>
                    <p className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
                      <FaGlobe className="text-[var(--text-accent)]" /> <strong>Experience Description:</strong>{" "}
                      {profile.experienceDescription || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    href="/profile?edit=true"
                    className="px-6 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                    style={{ background: "var(--accent)", color: "var(--white)", border: "1px solid var(--light)" }}
                    aria-label="Edit Profile"
                  >
                    Edit Profile
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

export default function Profile() {
  return (
    <Suspense
      fallback={
        <div
          className="pt-20 text-center flex items-center justify-center min-h-screen"
          style={{ color: "var(--text-body)" }}
        >
          Loading...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}