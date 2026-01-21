"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FaUser,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaIdCard,
  FaVenusMars,
  FaFileAlt,
  FaGraduationCap,
  FaClock,
  FaCar,
  FaCalendar,
  FaStar,
  FaCheckCircle,
  FaEdit,
  FaCamera,
  FaDownload,
  FaArrowRight,
  FaArrowLeft,
  FaMagic,
  FaTimes,
  FaBolt
} from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  nationality: string;
  city: string;
  visaType: string;
  gender: string;
  languagesSpoken: string[];
  whatsappNumber: string;
  highestEducation: string;
  yearsOfExperience: string;
  availability: string;
  experienceDescription: string;
  coverLetter: string; // New Field
  hasCarInUAE: boolean;
  isProfileComplete: boolean;
  profileImageUrl?: string;
  resumeUrl?: string;
}

function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [currentStep, setCurrentStep] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    nationality: "",
    city: "",
    visaType: "",
    gender: "",
    languagesSpoken: [],
    whatsappNumber: "",
    highestEducation: "",
    yearsOfExperience: "",
    availability: "",
    experienceDescription: "",
    coverLetter: "",
    hasCarInUAE: false,
    isProfileComplete: false,
    profileImageUrl: "",
    resumeUrl: "",
  });

  // Global skills database (Mock)
  const globalSkills = [
    "Event Planning", "Hostess", "Model", "Promoter", "Sales",
    "Customer Service", "Photography", "Videography", "Social Media",
    "Bartending", "Barista", "Waiter", "Security", "Driver",
    "Makeup Artist", "Hair Stylist", "DJ", "MC", "Dancer"
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          const [userDoc, skillsDoc] = await Promise.all([
            getDoc(doc(db, "users", user.uid)),
            getDoc(doc(db, "user_skills", user.uid))
          ]);

          if (userDoc.exists()) {
            setProfile(prev => ({ ...prev, ...userDoc.data() }));
          }
          if (skillsDoc.exists()) {
            setSkills(skillsDoc.data().skills || []);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillInput(val);
    if (val.length > 1) {
      setSuggestedSkills(globalSkills.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !skills.includes(s)));
    } else {
      setSuggestedSkills([]);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
      setSuggestedSkills([]);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleFileUpload = async (file: File, type: "image" | "resume") => {
    if (!file) return;
    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
      formData.append("folder", "eventopic");

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        formData
      );

      const url = res.data.secure_url;
      setProfile(prev => ({ ...prev, [type === "image" ? "profileImageUrl" : "resumeUrl"]: url }));

      // Instant save for file uploads
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          [type === "image" ? "profileImageUrl" : "resumeUrl"]: url
        }, { merge: true });
      }

      toast.update(toastId, { render: "Upload successful!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.update(toastId, { render: "Upload failed.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { ...profile, isProfileComplete: true }, { merge: true });
      await setDoc(doc(db, "user_skills", user.uid), { skills }, { merge: true });
      toast.success("Profile saved successfully!");
      // Small delay before redirect/refresh to show success
      setTimeout(() => {
        if (isEditMode) {
          router.push("/profile");
        } else {
          router.refresh();
        }
      }, 1000);
    } catch (err) {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="animate-spin w-16 h-16 border-t-4 border-[var(--primary)] rounded-full"></div>
    </div>;
  }

  // --- VIEW MODE ---
  if (!isEditMode && profile.isProfileComplete) {
    return (
      <>
        <Navbar />
        <section className="pt-28 pb-16 min-h-screen bg-[var(--background)]">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-4xl font-bold font-display gradient-text">{profile.firstName} {profile.lastName}</h1>
                <p className="text-[var(--text-secondary)]">{profile.highestEducation} • {profile.city}</p>
              </div>
              <Link href="/profile?edit=true" className="btn-secondary px-6 py-2 flex items-center gap-2">
                <FaEdit /> Edit Profile
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="glass-card p-6 text-center">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[var(--primary)] mb-4">
                    {profile.profileImageUrl ? (
                      <Image src={profile.profileImageUrl} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface-elevated)] flex items-center justify-center text-3xl font-bold">{profile.firstName[0]}</div>
                    )}
                  </div>
                  {profile.resumeUrl && (
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                      <FaDownload /> Download Resume
                    </a>
                  )}
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FaUser /> Contact</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Phone</span>
                      <span className="text-[var(--text-primary)]">{profile.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">WhatsApp</span>
                      <span className="text-[var(--text-primary)]">{profile.whatsappNumber || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Email</span>
                      <span className="text-[var(--text-primary)] truncate max-w-[150px]">{user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Bio / Cover Letter */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4 font-display flex items-center gap-2"><FaFileAlt className="text-[var(--primary)]" /> About Me</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {profile.coverLetter || profile.experienceDescription || "No bio added yet."}
                  </p>
                </div>

                {/* Skills */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-xl mb-4 font-display flex items-center gap-2"><FaStar className="text-[var(--accent)]" /> Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-[var(--surface-elevated)] rounded-full text-sm font-bold border border-[var(--border)]">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <div className="text-[var(--text-secondary)] text-sm mb-1">Experience</div>
                    <div className="font-bold text-[var(--text-primary)]">{profile.yearsOfExperience} Years</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-[var(--text-secondary)] text-sm mb-1">Education</div>
                    <div className="font-bold text-[var(--text-primary)]">{profile.highestEducation}</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-[var(--text-secondary)] text-sm mb-1">Nationality</div>
                    <div className="font-bold text-[var(--text-primary)]">{profile.nationality}</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-[var(--text-secondary)] text-sm mb-1">Availability</div>
                    <div className="font-bold text-[var(--text-primary)]">{profile.availability}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
        <ToastContainer theme="dark" position="bottom-right" />
      </>
    );
  }

  // --- WIZARD / EDIT MODE ---
  const steps = ["Personal Info", "Professional Details", "Skills & Media"];

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-16 min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="container max-w-3xl mx-auto px-4">

          {/* Steps Indicator */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--surface-elevated)] -z-10 rounded-full"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-[var(--primary)] -z-10 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 cursor-pointer ${i <= currentStep ? 'text-[var(--primary)]' : 'text-[var(--text-disabled)]'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${i <= currentStep ? 'bg-[var(--primary)] text-white shadow-lg scale-110' : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                  }`}>
                  {i + 1}
                </div>
                <span className="text-xs font-bold hidden sm:block">{step}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
            <AnimatePresence mode="wait">

              {/* STEP 1: PERSONAL INFO */}
              {currentStep === 0 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold font-display">Who are you?</h2>
                    <p className="text-[var(--text-secondary)]">Let's start with the basics.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">First Name</label>
                      <input name="firstName" value={profile.firstName} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Last Name</label>
                      <input name="lastName" value={profile.lastName} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Email</label>
                      <input disabled value={user?.email || ""} className="modern-input w-full p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Phone (Any Country)</label>
                      <input name="phoneNumber" value={profile.phoneNumber} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="+971 50 000 0000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Nationality</label>
                      <input name="nationality" value={profile.nationality} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="Your Nationality" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">City in UAE</label>
                      <select name="city" value={profile.city} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                        <option value="">Select City</option>
                        {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Gender</label>
                      <select name="gender" value={profile.gender} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PROFESSIONAL */}
              {currentStep === 1 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold font-display">Your Career</h2>
                    <p className="text-[var(--text-secondary)]">Tell us about your experience.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Highest Education</label>
                        <select name="highestEducation" value={profile.highestEducation} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                          <option value="">Select Level</option>
                          <option value="High School">High School</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor">Bachelor's Degree</option>
                          <option value="Master">Master's Degree</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Years of Experience</label>
                        <input type="number" name="yearsOfExperience" value={profile.yearsOfExperience} onChange={handleInputChange} className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="e.g. 5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2"><FaBolt className="text-[var(--primary)]" /> Cover Letter / Bio</label>
                      <textarea
                        name="coverLetter"
                        value={profile.coverLetter}
                        onChange={handleInputChange}
                        rows={6}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="Introduce yourself to recruiters. Why should they hire you?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold">Experience List (Optional)</label>
                      <textarea
                        name="experienceDescription"
                        value={profile.experienceDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="List key roles or companies you worked with..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SKILLS & MEDIA */}
              {currentStep === 2 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold font-display">Final Touches</h2>
                    <p className="text-[var(--text-secondary)]">Showcase your talent.</p>
                  </div>

                  {/* SKILLS */}
                  <div>
                    <label className="text-sm font-bold mb-2 block">Skills (Search or Add Custom)</label>
                    <div className="relative mb-4">
                      <input
                        value={skillInput}
                        onChange={handleSkillInput}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="Type a skill..."
                      />
                      {suggestedSkills.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl mt-2 z-20 shadow-xl overflow-hidden">
                          {suggestedSkills.map(s => (
                            <div key={s} onClick={() => addSkill(s)} className="p-3 hover:bg-[var(--primary)]/10 cursor-pointer">{s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center gap-2 text-sm font-bold">
                          {s}
                          <FaTimes className="cursor-pointer hover:text-red-500" onClick={() => removeSkill(s)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* MEDIA UPLOAD */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="text-center">
                      <label className="block text-sm font-bold mb-2">Profile Photo</label>
                      <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer group">
                        {profile.profileImageUrl ? (
                          <Image src={profile.profileImageUrl} alt="Preview" width={128} height={128} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
                            <FaCamera className="text-2xl mb-1" />
                            <span className="text-xs">Upload</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files?.[0]!, "image")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>

                    <div className="text-center">
                      <label className="block text-sm font-bold mb-2">Resume / CV</label>
                      <div className="relative h-32 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-all flex flex-col items-center justify-center cursor-pointer bg-[var(--surface)] text-[var(--text-secondary)]">
                        <FaFileAlt className="text-3xl mb-2" />
                        <span className="text-sm font-bold">{profile.resumeUrl ? "Resume Uploaded" : "Upload PDF"}</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e.target.files?.[0]!, "resume")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-[var(--border)]">
              {currentStep > 0 ? (
                <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                  <FaArrowLeft /> Back
                </button>
              ) : <div></div>}

              {currentStep < steps.length - 1 ? (
                <button onClick={nextStep} className="btn-primary px-8 py-2 flex items-center gap-2">
                  Next <FaArrowRight />
                </button>
              ) : (
                <button onClick={saveProfile} disabled={saving} className="btn-primary px-8 py-2 flex items-center gap-2 disabled:opacity-70">
                  {saving ? "Saving..." : "Finish & Save"} <FaCheckCircle />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <ToastContainer theme="dark" position="bottom-right" />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="animate-spin w-16 h-16 border-t-4 border-[var(--primary)] rounded-full"></div>
    </div>}>
      <ProfileContent />
    </Suspense>
  );
}
