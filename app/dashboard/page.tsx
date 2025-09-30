//app/dashboard/page.tsx

"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUser,
  FaVenusMars,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaBriefcase,
  FaImage,
  FaFileAlt,
  FaDownload,
  FaSpinner,
  FaGlobe ,
} from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

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

interface Application {
  id: string;
  jobId: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
  const [applications, setApplications] = useState<
    (Application & { jobTitle?: string; jobDescription?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    console.log("Dashboard useEffect: user = " + user?.uid + ", loading = " + loading);
    if (!loading && !user) {
      console.log("Dashboard: Redirecting to homepage (user is null, loading: " + loading + ")");
      router.push("/");
      return;
    }
    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          console.log("Dashboard: Fetching data for user " + user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const skillsDoc = await getDoc(doc(db, "user_skills", user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as Profile;
            console.log("Dashboard: Fetched profile data from Firestore: ", userData);
            setProfile(userData);
            const fields = [
              userData.firstName,
              userData.lastName,
              userData.dateOfBirth,
              userData.phoneNumber,
              userData.nationality,
              userData.countryOfResidence,
              userData.city,
              userData.visaType,
              userData.gender,
              userData.whatsappNumber,
              userData.hourlyRate,
              userData.highestEducation,
              userData.yearsOfExperience,
              userData.previousRelatedExperience,
              userData.availability,
              userData.experienceDescription,
              userData.secondNationality,
              userData.profileImageUrl,
              userData.resumeUrl,
            ].filter(Boolean);
            const arrayFields = [
              userData.languagesSpoken.length,
              userData.openToWorkIn.length,
              userData.talents.length,
            ].filter((count) => count > 0);
            const completion = Math.round(
              ((fields.length + arrayFields.length) / 22) * 100
            );
            setProfileCompletion(completion);
          } else {
            console.log("Dashboard: No profile data found in Firestore for user: " + user.uid);
            toast.error("No profile found. Please create your profile.");
            router.push("/profile");
            return;
          }
          if (skillsDoc.exists()) {
            const skillsData = skillsDoc.data().skills || [];
            console.log("Dashboard: Fetched skills data from Firestore: ", skillsData);
            setSkills(skillsData);
          } else {
            console.log("Dashboard: No skills data found in Firestore for user: " + user.uid);
          }

          const appsQuery = query(
            collection(db, "applications"),
            where("userEmail", "==", user.email!)
          );
          const appsSnapshot = await getDocs(appsQuery);
          const appsList = await Promise.all(
            appsSnapshot.docs.map(async (appDoc) => {
              const appData = appDoc.data() as Application;
              const jobDoc = await getDoc(doc(db, "jobs", appData.jobId));
              let jobTitle = "Unknown Job";
              let jobDescription = "";
              if (jobDoc.exists()) {
                const jobData = jobDoc.data() as Job;
                jobTitle = jobData.title;
                jobDescription = jobData.description || "";
              }
              return { ...appData, id: appDoc.id, jobTitle, jobDescription };
            })
          );
          console.log("Dashboard: Fetched applications: ", appsList);
          setApplications(appsList);

          setIsLoading(false);
        } catch (error: unknown) {
          console.error("Dashboard: Fetch data error: ", error instanceof Error ? error.message : error);
          toast.error("Error fetching data. Please try again.");
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  const handleFileUpload = async (file: File | null, type: "image" | "resume") => {
    if (!file) {
      console.log("Dashboard: No " + type + " file selected for upload");
      toast.error("Please select a file to upload.");
      return;
    }
    if (file.size > 200 * 1024) {
      console.log("Dashboard: " + type + " file too large: " + file.name + ", size: " + file.size + " bytes");
      toast.error((type === "image" ? "Profile image" : "Resume") + " must be under 200KB.");
      return;
    }
    try {
      setUploadingImage(type === "image" ? true : uploadingImage);
      setUploadingResume(type === "resume" ? true : uploadingResume);
      console.log("Dashboard: Uploading " + type + " to Cloudinary: " + file.name);
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
      console.log("Dashboard: " + type + " uploaded successfully, URL: " + url);
      const userRef = doc(db, "users", user!.uid);
      await updateDoc(userRef, {
        [type === "image" ? "profileImageUrl" : "resumeUrl"]: url,
      });
      console.log("Dashboard: Updated Firestore with " + type + " URL for user: " + user!.uid);
      setProfile((prev) => ({
        ...prev,
        [type === "image" ? "profileImageUrl" : "resumeUrl"]: url,
      }));
      toast.success((type === "image" ? "Profile image" : "Resume") + " uploaded successfully!");
    } catch (error: unknown) {
      console.error("Dashboard: Error uploading " + type + ": ", error instanceof Error ? error.message : error);
      toast.error("Failed to upload " + (type === "image" ? "profile image" : "resume") + ". Please try again.");
    } finally {
      setUploadingImage(type === "image" ? false : uploadingImage);
      setUploadingResume(type === "resume" ? false : uploadingResume);
    }
  };

  const profileChartData = {
    datasets: [
      {
        data: [profileCompletion, 100 - profileCompletion],
        backgroundColor: ["var(--color-accent)", "var(--soft)"],
        borderColor: ["var(--teal-accent)", "var(--light)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      animateRotate: true,
      duration: 1000,
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  if (loading || isLoading) {
    return (
      <div className="pt-20 text-center flex items-center justify-center min-h-screen bg-[var(--primary)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center justify-center"
        >
          <FaSpinner className="text-4xl text-[var(--color-accent)]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

  const profileText = [
    niceSkills.join(" "),
    profile.talents.join(" "),
    profile.languagesSpoken.join(" "),
    profile.previousRelatedExperience,
    profile.experienceDescription,
    profile.yearsOfExperience,
    profile.availability,
    profile.highestEducation,
  ].join(" ").toLowerCase();
  const profileWords = profileText.match(/\w+/g) || [];
  const profileSet = new Set(profileWords);

  const computeMatch = (jobTitle: string, jobDescription: string) => {
    const jobText = (jobTitle + " " + jobDescription).toLowerCase();
    const jobWords = jobText.match(/\w+/g) || [];
    const jobSet = new Set(jobWords);
    if (jobSet.size === 0) return 0;
    const intersection = [...jobSet].filter((word) => profileSet.has(word)).length;
    return Math.round((intersection / jobSet.size) * 100);
  };

  return (
    <>
      <Navbar />
      <section className="pt-20 bg-[var(--secondary)] min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 font-heading text-[var(--text-accent)]"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
            aria-label="Your Dashboard"
          >
            Your Dashboard
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-[var(--light)]/30 bg-[var(--primary)]/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
                  <FaImage /> Profile Image
                </h2>
                <motion.div
                  className="mb-8 p-6 rounded-2xl border-4 border-[var(--color-accent)]/60 bg-[var(--primary)]/60 backdrop-blur-sm shadow-xl group"
                  whileHover={{ y: -10, scale: 1.05, boxShadow: "0 0 15px rgba(0, 196, 180, 0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  {profile.profileImageUrl ? (
                    <div className="flex flex-col items-center">
                      <Image
                        src={profile.profileImageUrl || "/placeholder.png"}
                        alt="Profile"
                        width={192}
                        height={192}
                        className="rounded-full object-cover mb-4 border-4 border-[var(--color-accent)] shadow-md aspect-[1/1]"
                        quality={85}
                      />
                      <motion.button
                        onClick={() => {
                          console.log("Dashboard: Downloading profile image, URL: " + profile.profileImageUrl);
                          const link = document.createElement("a");
                          link.href = profile.profileImageUrl!;
                          link.download = "profile-image";
                          link.click();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                        style={{ background: "var(--accent)", color: "var(--white)" }}
                        aria-label="Download Profile Image"
                      >
                        <FaDownload /> Download Profile Image
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log("Dashboard: Profile image selected: " + (file?.name || "none") + ", size: " + (file?.size || 0) + " bytes");
                          setProfileImage(file);
                        }}
                        className="mb-4 text-base text-[var(--text-body)] bg-[var(--soft)] p-4 rounded-lg border-2 border-[var(--light)]/60 focus:border-[var(--color-accent)] w-full cursor-pointer"
                        aria-label="Upload Profile Image"
                      />
                      {profileImage && (
                        <p className="text-base mb-4 font-medium text-[var(--text-body)]">
                          Selected: {profileImage.name} ({(profileImage.size / 1024).toFixed(2)}KB)
                        </p>
                      )}
                      <motion.button
                        onClick={() => profileImage && handleFileUpload(profileImage, "image")}
                        disabled={!profileImage || uploadingImage}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 disabled:opacity-50 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                        style={{ background: "var(--accent)", color: "var(--white)" }}
                        aria-label="Upload Profile Image"
                      >
                        {uploadingImage ? (
                          <>
                            <FaSpinner className="animate-spin" size={20} /> Uploading...
                          </>
                        ) : (
                          <>
                            <FaImage /> Upload Profile Image
                          </>
                        )}
                      </motion.button>
                      <p className="text-sm mt-3 font-body text-[var(--text-body)]">
                        Max size: 200KB (PNG, JPEG)
                      </p>
                    </div>
                  )}
                </motion.div>

                <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
                  <FaFileAlt /> Resume
                </h2>
                <motion.div
                  className="mb-8 p-6 rounded-2xl border-4 border-[var(--color-accent)]/60 bg-[var(--primary)]/60 backdrop-blur-sm shadow-xl group"
                  whileHover={{ y: -10, scale: 1.05, boxShadow: "0 0 15px rgba(0, 196, 180, 0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  {profile.resumeUrl ? (
                    <div className="flex flex-col items-center">
                      <p className="text-base mb-4 font-medium text-[var(--text-body)]">
                        Resume uploaded. Click to download.
                      </p>
                      <motion.button
                        onClick={() => {
                          console.log("Dashboard: Downloading resume, URL: " + profile.resumeUrl);
                          const link = document.createElement("a");
                          link.href = profile.resumeUrl!;
                          link.download = "resume";
                          link.click();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                        style={{ background: "var(--accent)", color: "var(--white)" }}
                        aria-label="Download Resume"
                      >
                        <FaDownload /> Download Resume
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log("Dashboard: Resume selected: " + (file?.name || "none") + ", size: " + (file?.size || 0) + " bytes");
                          setResume(file);
                        }}
                        className="mb-4 text-base text-[var(--text-body)] bg-[var(--soft)] p-4 rounded-lg border-2 border-[var(--light)]/60 focus:border-[var(--color-accent)] w-full cursor-pointer"
                        aria-label="Upload Resume"
                      />
                      {resume && (
                        <p className="text-base mb-4 font-medium text-[var(--text-body)]">
                          Selected: {resume.name} ({(resume.size / 1024).toFixed(2)}KB)
                        </p>
                      )}
                      <motion.button
                        onClick={() => resume && handleFileUpload(resume, "resume")}
                        disabled={!resume || uploadingResume}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 disabled:opacity-50 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                        style={{ background: "var(--accent)", color: "var(--white)" }}
                        aria-label="Upload Resume"
                      >
                        {uploadingResume ? (
                          <>
                            <FaSpinner className="animate-spin" size={20} /> Uploading...
                          </>
                        ) : (
                          <>
                            <FaFileAlt /> Upload Resume
                          </>
                        )}
                      </motion.button>
                      <p className="text-sm mt-3 font-body text-[var(--text-body)]">
                        Max size: 200KB (PDF, DOC, DOCX)
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
                  <FaStar /> Profile Completion
                </h2>
                <motion.div
                  className="mb-8 p-6 rounded-2xl border-4 border-[var(--color-accent)]/60 bg-[var(--primary)]/60 backdrop-blur-sm shadow-xl group"
                  whileHover={{ y: -10, scale: 1.05, boxShadow: "0 0 15px rgba(0, 196, 180, 0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <Doughnut data={profileChartData} options={chartOptions} />
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[var(--text-accent)]">
                        {profileCompletion}%
                      </span>
                    </div>
                    {!profile.isProfileComplete && (
                      <p className="text-sm mt-4 font-body text-[var(--text-body)]">
                        Complete your profile to unlock more opportunities!
                      </p>
                    )}
                  </div>
                </motion.div>

                <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
                  <FaUser /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaUser className="text-[var(--text-accent)]" /> <strong>Name:</strong>{" "}
                      {profile.firstName} {profile.lastName}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaVenusMars className="text-[var(--text-accent)]" /> <strong>Gender:</strong>{" "}
                      {profile.gender || "Not set"}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaMapMarkerAlt className="text-[var(--text-accent)]" /> <strong>Location:</strong>{" "}
                      {profile.city}, {profile.countryOfResidence}
                    </motion.div>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaClock className="text-[var(--text-accent)]" /> <strong>Years of Experience:</strong>{" "}
                      {profile.yearsOfExperience || "Not set"}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaClock className="text-[var(--text-accent)]" /> <strong>Availability:</strong>{" "}
                      {profile.availability || "Not set"}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaMapMarkerAlt className="text-[var(--text-accent)]" /> <strong>Open to Work In:</strong>{" "}
                      {profile.openToWorkIn.length > 0 ? profile.openToWorkIn.join(", ") : "Not set"}
                    </motion.div>
                  </div>
                </div>

                <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
                  <FaStar /> Skills & Experience
                </h2>
                <div className="bg-[var(--primary)]/50 p-6 rounded-xl border border-[var(--light)]/20 mb-8">
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-accent)] scrollbar-track-[var(--secondary)]">
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
                      <p className="text-sm font-body text-[var(--text-body)]">
                        No skills added yet.
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaStar className="text-[var(--text-accent)]" /> <strong>Talents:</strong>{" "}
                      {profile.talents.length > 0 ? profile.talents.join(", ") : "Not set"}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaGlobe className="text-[var(--text-accent)]" /> <strong>Languages:</strong>{" "}
                      {profile.languagesSpoken.length > 0 ? profile.languagesSpoken.join(", ") : "Not set"}
                    </motion.div>
                  </div>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaGlobe className="text-[var(--text-accent)]" /> <strong>Previous Experience:</strong>{" "}
                      {profile.previousRelatedExperience || "Not set"}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-center gap-2 p-4 bg-[var(--primary)]/50 rounded-xl border border-[var(--light)]/20"
                      style={{ color: "var(--text-body)" }}
                    >
                      <FaGlobe className="text-[var(--text-accent)]" /> <strong>Experience Description:</strong>{" "}
                      {profile.experienceDescription || "Not set"}
                    </motion.div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/profile?edit=true"
                      className="px-6 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                      style={{ background: "var(--accent)", color: "var(--white)" }}
                      aria-label="Edit Profile"
                    >
                      Edit Profile
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2 text-[var(--text-accent)]">
              <FaBriefcase /> Applied Jobs ({applications.length})
            </h2>
            {applications.length === 0 ? (
              <p className="text-center text-[var(--text-body)]">
                No jobs applied yet.
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const matchPercentage = computeMatch(
                    app.jobTitle || "",
                    app.jobDescription || ""
                  );
                  const matchChartData = {
                    datasets: [
                      {
                        data: [matchPercentage, 100 - matchPercentage],
                        backgroundColor: ["var(--color-accent)", "var(--soft)"],
                        borderColor: ["var(--teal-accent)", "var(--light)"],
                        borderWidth: 1,
                      },
                    ],
                  };
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-[var(--primary)]/50 p-6 rounded-xl border border-[var(--light)]/20 flex flex-col md:flex-row justify-between items-center gap-4 group"
                      whileHover={{ y: -10, scale: 1.05 }}
                    >
                      <div className="flex-grow">
                        <p className="font-semibold text-lg text-[var(--text-accent)]">
                          {app.jobTitle || "Unknown"}
                        </p>
                        <p className="text-sm text-[var(--text-body)]">
                          Status: <span className="capitalize">{app.status}</span>
                        </p>
                        <p className="text-sm text-[var(--text-body)]">
                          Applied on: {new Date(app.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm font-semibold mb-2 text-[var(--text-accent)]">
                          Match Rating
                        </p>
                        <div className="relative w-16 h-16">
                          <Doughnut
                            data={matchChartData}
                            options={{
                              cutout: "60%",
                              responsive: true,
                              maintainAspectRatio: true,
                              animation: {
                                animateRotate: true,
                                duration: 1000,
                              },
                              plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false },
                              },
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--text-accent)]">
                            {matchPercentage}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard/settings"
                  className="px-6 py-3 rounded-full font-semibold font-body text-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-accent)] group-hover:to-[var(--teal-accent)]"
                  style={{ background: "var(--accent)", color: "var(--white)", border: "1px solid var(--light)" }}
                  aria-label="Manage Settings"
                >
                  Manage Settings
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
