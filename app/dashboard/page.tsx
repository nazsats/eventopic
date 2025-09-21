"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import Image from "next/image"; // Added import for Image
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUser,
  FaVenusMars,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaHome,
  FaBriefcase,
  FaImage,
  FaFileAlt,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

// Register Chart.js components
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

  useEffect(() => {
    console.log("Dashboard useEffect: user =", user?.uid, "loading =", loading);
    if (!loading && !user) {
      console.log("Dashboard: Redirecting to homepage (user is null, loading:", loading, ")");
      router.push("/");
      return;
    }
    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          console.log("Dashboard: Fetching data for user", user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const skillsDoc = await getDoc(doc(db, "user_skills", user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as Profile;
            console.log("Dashboard: Fetched profile data from Firestore:", userData);
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
            console.log("Dashboard: No profile data found in Firestore for user:", user.uid);
            toast.error("No profile found. Please create your profile.");
            router.push("/profile");
            return;
          }
          if (skillsDoc.exists()) {
            const skillsData = skillsDoc.data().skills || [];
            console.log("Dashboard: Fetched skills data from Firestore:", skillsData);
            setSkills(skillsData);
          } else {
            console.log("Dashboard: No skills data found in Firestore for user:", user.uid);
          }

          // Fetch applications
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
          console.log("Dashboard: Fetched applications:", appsList);
          setApplications(appsList);

          setIsLoading(false);
        } catch (error: unknown) {
          console.error("Dashboard: Fetch data error:", error instanceof Error ? error.message : error);
          toast.error("Error fetching data. Please try again.");
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  // Handle file uploads to Cloudinary
  const handleFileUpload = async (file: File | null, type: "image" | "resume") => {
    if (!file) {
      console.log(`Dashboard: No ${type} file selected for upload`);
      toast.error("Please select a file to upload.");
      return;
    }

    // Validate file size (200KB = 200 * 1024 bytes)
    if (file.size > 200 * 1024) {
      console.log(`Dashboard: ${type} file too large: ${file.name}, size: ${file.size} bytes`);
      toast.error(`${type === "image" ? "Profile image" : "Resume"} must be under 200KB.`);
      return;
    }

    try {
      console.log(`Dashboard: Uploading ${type} to Cloudinary:`, file.name);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "eventopic_unsigned");
      formData.append("folder", "eventopic");
      formData.append("api_key", "381131836444186");
      formData.append("resource_type", type === "image" ? "image" : "raw");

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type === "image" ? "image" : "raw"}/upload`,
        formData
      );

      const url = response.data.secure_url;
      console.log(`Dashboard: ${type} uploaded successfully, URL:`, url);
      const userRef = doc(db, "users", user!.uid);
      await updateDoc(userRef, {
        [type === "image" ? "profileImageUrl" : "resumeUrl"]: url,
      });
      console.log(`Dashboard: Updated Firestore with ${type} URL for user:`, user!.uid);

      setProfile((prev) => {
        const updatedProfile = { ...prev, [type === "image" ? "profileImageUrl" : "resumeUrl"]: url };
        console.log(`Dashboard: Updated profile state with ${type} URL:`, updatedProfile);
        return updatedProfile;
      });
      toast.success(`${type === "image" ? "Profile image" : "Resume"} uploaded successfully!`);
    } catch (error: unknown) {
      console.error(`Dashboard: Error uploading ${type}:`, error instanceof Error ? error.message : error);
      toast.error(`Failed to upload ${type === "image" ? "profile image" : "resume"}. Please try again.`);
    }
  };

  // Profile completion chart data
  const profileChartData = {
    datasets: [
      {
        data: [profileCompletion, 100 - profileCompletion],
        backgroundColor: ["#00C4B4", "rgba(255, 255, 255, 0.2)"],
        borderColor: ["#00C4B4", "rgba(255, 255, 255, 0.2)"],
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
    console.log("Dashboard: Rendering loader (loading =", loading, ", isLoading =", isLoading, ")");
    return (
      <div
        className="pt-28 text-center flex items-center justify-center min-h-screen bg-[var(--secondary)]"
        style={{
          background: "linear-gradient(135deg, var(--accent)/10, var(--teal-accent)/5)",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center justify-center"
        >
          <FaSpinner className="text-4xl" style={{ color: "var(--white)" }} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    console.log("Dashboard: No user, returning null");
    return null;
  }

  // Map skills to nice names
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

  // Profile keywords for matching
  const profileText = [
    niceSkills.join(" "),
    profile.talents.join(" "),
    profile.languagesSpoken.join(" "),
    profile.previousRelatedExperience,
    profile.experienceDescription,
    profile.yearsOfExperience,
    profile.availability,
    profile.highestEducation,
  ]
    .join(" ")
    .toLowerCase();
  const profileWords = profileText.match(/\w+/g) || [];
  const profileSet = new Set(profileWords);

  // Function to compute match percentage
  const computeMatch = (jobTitle: string, jobDescription: string) => {
    const jobText = (jobTitle + " " + jobDescription).toLowerCase();
    const jobWords = jobText.match(/\w+/g) || [];
    const jobSet = new Set(jobWords);
    if (jobSet.size === 0) return 0;
    const intersection = [...jobSet].filter((word) => profileSet.has(word)).length;
    return Math.round((intersection / jobSet.size) * 100);
  };

  console.log("Dashboard: Rendering main content - profileImageUrl:", profile.profileImageUrl);
  console.log("Dashboard: Rendering main content - resumeUrl:", profile.resumeUrl);

  return (
    <>
      <Navbar />
      <section className="pt-28 bg-[var(--secondary)] min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--teal-accent)]/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-8 font-heading"
            style={{ color: "var(--white)" }}
          >
            Your Dashboard
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold font-body transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--teal-accent))",
                color: "#ffffff",
              }}
              aria-label="Back to Home"
            >
              <FaHome /> Back to Home
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="card p-8 rounded-2xl shadow-2xl border border-[var(--accent)]/30 bg-[var(--primary)]/80 backdrop-blur-md">
              {/* Profile Completion Pie Chart */}
              <div className="mb-8 flex flex-col items-center">
                <h2
                  className="text-xl font-semibold mb-4 font-heading flex items-center gap-2"
                  style={{ color: "var(--accent)" }}
                >
                  <FaStar /> Profile Completion
                </h2>
                <div className="relative w-32 h-32">
                  <Doughnut data={profileChartData} options={chartOptions} />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xl font-bold"
                    style={{ color: "var(--white)" }}
                  >
                    {profileCompletion}%
                  </span>
                </div>
                {!profile.isProfileComplete && (
                  <p className="text-sm mt-2 font-body" style={{ color: "var(--light)" }}>
                    Complete your profile to unlock more opportunities!
                  </p>
                )}
              </div>

              {/* Profile Image */}
              <h2
                className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <FaImage /> Profile Image
              </h2>
              <motion.div
                className="mb-8 p-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--secondary)]/50"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {profile.profileImageUrl ? (
                  <div className="flex flex-col items-center">
                    <Image
                      src={profile.profileImageUrl || "/placeholder.png"}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="rounded-full object-cover mb-4 border-2 border-[var(--accent)]"
                      quality={85}
                    />
                    <button
                      onClick={() => {
                        console.log("Dashboard: Downloading profile image, URL:", profile.profileImageUrl);
                        const link = document.createElement("a");
                        link.href = profile.profileImageUrl!;
                        link.download = "profile-image";
                        link.click();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold font-body transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, var(--accent), var(--teal-accent))",
                        color: "#ffffff",
                      }}
                    >
                      <FaDownload /> Download Profile Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        console.log("Dashboard: Profile image selected:", file?.name, file?.size);
                        setProfileImage(file);
                      }}
                      className="mb-4 text-base text-[var(--white)] bg-[var(--soft)] p-4 rounded-lg border-2 border-[var(--light)]/60 focus:border-[var(--color-accent)] w-full cursor-pointer"
                    />
                    {profileImage && (
                      <p className="text-base mb-4 font-medium" style={{ color: "var(--light)" }}>
                        Selected: {profileImage.name} ({(profileImage.size / 1024).toFixed(2)}KB)
                      </p>
                    )}
                    <motion.button
                      onClick={() => profileImage && handleFileUpload(profileImage, "image")}
                      disabled={!profileImage}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold font-body transition-all duration-300 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, var(--accent), var(--teal-accent))",
                        color: "#ffffff",
                      }}
                    >
                      <FaImage /> Upload Profile Image
                    </motion.button>
                    <p className="text-sm mt-2 font-body" style={{ color: "var(--light)" }}>
                      Max size: 200KB
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Resume */}
              <h2
                className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <FaFileAlt /> Resume
              </h2>
              <motion.div
                className="mb-8 p-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--secondary)]/50"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {profile.resumeUrl ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm mb-4" style={{ color: "var(--light)" }}>
                      Resume uploaded. Click to download.
                    </p>
                    <button
                      onClick={() => {
                        console.log("Dashboard: Downloading resume, URL:", profile.resumeUrl);
                        const link = document.createElement("a");
                        link.href = profile.resumeUrl!;
                        link.download = "resume";
                        link.click();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold font-body transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, var(--accent), var(--teal-accent))",
                        color: "#ffffff",
                      }}
                    >
                      <FaDownload /> Download Resume
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        console.log("Dashboard: Resume selected:", file?.name, file?.size);
                        setResume(file);
                      }}
                      className="mb-4 text-base text-[var(--white)] bg-[var(--soft)] p-4 rounded-lg border-2 border-[var(--light)]/60 focus:border-[var(--color-accent)] w-full cursor-pointer"
                    />
                    {resume && (
                      <p className="text-base mb-4 font-medium" style={{ color: "var(--light)" }}>
                        Selected: {resume.name} ({(resume.size / 1024).toFixed(2)}KB)
                      </p>
                    )}
                    <motion.button
                      onClick={() => resume && handleFileUpload(resume, "resume")}
                      disabled={!resume}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold font-body transition-all duration-300 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, var(--accent), var(--teal-accent))",
                        color: "#ffffff",
                      }}
                    >
                      <FaFileAlt /> Upload Resume
                    </motion.button>
                    <p className="text-sm mt-2 font-body" style={{ color: "var(--light)" }}>
                      Max size: 200KB (PDF, DOC, DOCX)
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Basic Information */}
              <h2
                className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <FaUser /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 p-4 bg-[var(--secondary)]/50 rounded-xl"
                  style={{ color: "var(--light)" }}
                >
                  <FaUser className="text-[var(--accent)]" /> <strong>Name:</strong>{" "}
                  {profile.firstName} {profile.lastName}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center gap-2 p-4 bg-[var(--secondary)]/50 rounded-xl"
                  style={{ color: "var(--light)" }}
                >
                  <FaVenusMars className="text-[var(--accent)]" /> <strong>Gender:</strong>{" "}
                  {profile.gender || "Not set"}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-2 p-4 bg-[var(--secondary)]/50 rounded-xl"
                  style={{ color: "var(--light)" }}
                >
                  <FaMapMarkerAlt className="text-[var(--accent)]" /> <strong>Location:</strong>{" "}
                  {profile.city}, {profile.countryOfResidence}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center gap-2 p-4 bg-[var(--secondary)]/50 rounded-xl"
                  style={{ color: "var(--light)" }}
                >
                  <FaClock className="text-[var(--accent)]" /> <strong>Years of Experience:</strong>{" "}
                  {profile.yearsOfExperience || "Not set"}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-center gap-2 p-4 bg-[var(--secondary)]/50 rounded-xl"
                  style={{ color: "var(--light)" }}
                >
                  <FaClock className="text-[var(--accent)]" /> <strong>Availability:</strong>{" "}
                  {profile.availability || "Not set"}
                </motion.div>
              </div>

              {/* Edit Profile Button */}
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/profile?edit=true"
                    className="px-6 py-3 rounded-full font-semibold font-body transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, var(--accent), var(--teal-accent))",
                      color: "#ffffff",
                    }}
                    aria-label="Edit Profile"
                  >
                    Edit Profile
                  </Link>
                </motion.div>
              </div>

              {/* Applied Jobs Section */}
              <h2
                className="text-2xl font-semibold mb-6 font-heading flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <FaBriefcase /> Applied Jobs ({applications.length})
              </h2>
              {applications.length === 0 ? (
                <p className="text-center" style={{ color: "var(--light)" }}>
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
                          backgroundColor: ["#00C4B4", "rgba(255, 255, 255, 0.2)"],
                          borderColor: ["#00C4B4", "rgba(255, 255, 255, 0.2)"],
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
                        className="bg-[var(--secondary)]/50 p-6 rounded-xl border border-[var(--accent)]/20 flex flex-col md:flex-row justify-between items-center gap-4"
                      >
                        <div className="flex-grow">
                          <p
                            className="font-semibold text-lg"
                            style={{ color: "var(--light)" }}
                          >
                            {app.jobTitle || "Unknown"}
                          </p>
                          <p className="text-sm" style={{ color: "var(--light)" }}>
                            Status: <span className="capitalize">{app.status}</span>
                          </p>
                          <p className="text-sm" style={{ color: "var(--light)" }}>
                            Applied on: {new Date(app.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p
                            className="text-sm font-semibold mb-2"
                            style={{ color: "var(--accent)" }}
                          >
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
                            <span
                              className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                              style={{ color: "var(--white)" }}
                            >
                              {matchPercentage}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Other Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/dashboard/settings"
                    className="px-6 py-3 rounded-full font-semibold font-body transition-all duration-300 border-2 border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                    style={{ background: "transparent", color: "var(--accent)" }}
                    aria-label="Manage Settings"
                  >
                    Manage Settings
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}