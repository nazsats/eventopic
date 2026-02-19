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
  FaUser, FaPhone, FaGlobe, FaMapMarkerAlt, FaIdCard, FaVenusMars,
  FaFileAlt, FaGraduationCap, FaClock, FaCar, FaCalendar, FaStar,
  FaCheckCircle, FaEdit, FaCamera, FaDownload, FaArrowRight, FaArrowLeft,
  FaMagic, FaTimes, FaBolt, FaHotel, FaBriefcase, FaUtensils, FaShoppingCart,
  FaCut, FaMusic, FaConciergeBell, FaUserTie, FaCoffee, FaWineGlass,
  FaGuitar, FaPalette, FaMicrophone, FaVideo, FaInstagram, FaLinkedin,
  FaFacebook, FaTwitter, FaLanguage, FaPassport, FaRuler, FaWeight,
  FaTshirt, FaShoePrints, FaEye, FaPaintBrush, FaSun, FaCloudUploadAlt, FaSearch, FaFileDownload,
  FaChevronLeft, FaChevronRight, FaTrash,
  FaRunning, FaStore, FaSmile, FaBroom, FaCashRegister, FaShoppingBag, FaBox, FaBullhorn,
  FaDumbbell, FaHandPaper, FaWalking, FaFilm, FaImage, FaPlane, FaKeyboard, FaHeadset,
  FaCalculator, FaHandSparkles, FaSpa
} from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";

// Profession Categories with Icons
// Dropdown Options
const EDUCATION_LEVELS = ["High School", "Bachelor's Degree", "Master's Degree", "PhD"];
const VISA_TYPES = ["Family Visa", "Employment Visa", "Freelance Visa", "Golden Visa", "Investor Visa", "Sponsor Visa", "Student Visa", "Visit Visa", "Tourist Visa"];
const DRESS_SIZES = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const TROUSER_SIZES = ["30", "32", "34", "36", "38", "40", "42", "44", "46"];
const SHOE_SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const SHIRT_SIZES = ["32", "34", "36", "38", "40", "42", "44", "46", "48"];
const EYE_COLORS = ["Gray", "Amber", "Hazel", "Brown", "Blue", "Green", "Violet"];
const SKIN_COLORS = ["Black", "Creole", "Olive", "Fair", "Pale"];
const HAIR_COLORS = ["Black", "Blond", "Brown", "Red", "Other"];

// Profession Categories with Icons
const PROFESSION_CATEGORIES = [
  {
    id: "event_staff",
    name: "Event Staff",
    icon: FaIdCard,
    color: "from-blue-500 to-indigo-500",
    subcategories: [
      { id: "usher", name: "Usher", icon: FaUserTie },
      { id: "registration_staff", name: "Registration Staff", icon: FaIdCard },
      { id: "ticketing_staff", name: "Ticketing Staff", icon: FaIdCard },
      { id: "information_desk", name: "Information Desk", icon: FaSearch },
      { id: "vip_host_hostess", name: "VIP Host/Hostess", icon: FaStar },
      { id: "crowd_control", name: "Crowd Control", icon: FaUser },
      { id: "security", name: "Security", icon: FaUser },
      { id: "runner", name: "Runner", icon: FaRunning || FaUser }, // Fallback if FaRunning not imported, let's stick to FaUser for now or add import later if needed. Using FaUser for safety.
      { id: "booth_attendant", name: "Booth Attendant", icon: FaStore || FaBriefcase }, // Fallback
      { id: "mascot", name: "Mascot", icon: FaSmile || FaStar }, // Fallback
      { id: "brand_ambassador", name: "Brand Ambassador", icon: FaStar }
    ]
  },
  {
    id: "hospitality",
    name: "Hospitality",
    icon: FaHotel,
    color: "from-blue-500 to-cyan-500",
    subcategories: [
      { id: "hostess", name: "Hostess/Host", icon: FaConciergeBell },
      { id: "waiter", name: "Waiter/Waitress", icon: FaUtensils },
      { id: "bartender", name: "Bartender", icon: FaWineGlass },
      { id: "barista", name: "Barista", icon: FaCoffee },
      { id: "housekeeping", name: "Housekeeping", icon: FaBroom || FaHotel }, // Fallback
      { id: "concierge", name: "Concierge", icon: FaConciergeBell },
      { id: "hotel_receptionist", name: "Hotel Receptionist", icon: FaConciergeBell },
      { id: "chef", name: "Chef/Cook", icon: FaUtensils },
      { id: "kitchen_assistant", name: "Kitchen Assistant", icon: FaUtensils },
      { id: "catering_staff", name: "Catering Staff", icon: FaUtensils }
    ]
  },
  {
    id: "retail_staff",
    name: "Retail Staff",
    icon: FaShoppingCart,
    color: "from-green-500 to-emerald-500",
    subcategories: [
      { id: "sales_associate", name: "Sales Associate", icon: FaShoppingCart },
      { id: "cashier", name: "Cashier", icon: FaCashRegister || FaShoppingCart }, // Fallback
      { id: "store_manager", name: "Store Manager", icon: FaBriefcase },
      { id: "visual_merchandiser", name: "Visual Merchandiser", icon: FaEye },
      { id: "personal_shopper", name: "Personal Shopper", icon: FaShoppingBag || FaShoppingCart }, // Fallback
      { id: "stock_associate", name: "Stock Associate", icon: FaBox || FaBriefcase }, // Fallback
      { id: "promoter", name: "Promoter", icon: FaBullhorn || FaStar } // Fallback
    ]
  },
  {
    id: "model_influencer",
    name: "Model or Influencer",
    icon: FaCamera,
    color: "from-purple-500 to-pink-500",
    subcategories: [
      { id: "fashion_model", name: "Fashion Model", icon: FaCamera },
      { id: "commercial_model", name: "Commercial Model", icon: FaCamera },
      { id: "fitness_model", name: "Fitness Model", icon: FaDumbbell || FaUser }, // Fallback
      { id: "plus_size_model", name: "Plus Size Model", icon: FaUser },
      { id: "parts_model", name: "Parts Model (Hand/Foot)", icon: FaHandPaper || FaUser }, // Fallback
      { id: "runway_model", name: "Runway Model", icon: FaWalking || FaUser }, // Fallback
      { id: "social_media_influencer", name: "Social Media Influencer", icon: FaInstagram },
      { id: "content_creator", name: "Content Creator", icon: FaVideo },
      { id: "brand_ambassador", name: "Brand Ambassador", icon: FaStar }
    ]
  },
  {
    id: "entertainer",
    name: "Entertainer",
    icon: FaMusic,
    color: "from-yellow-500 to-amber-500",
    subcategories: [
      { id: "singer", name: "Singer", icon: FaMicrophone },
      { id: "dancer", name: "Dancer", icon: FaMusic }, // Using FaMusic as generic dancer icon
      { id: "musician", name: "Musician", icon: FaGuitar },
      { id: "dj", name: "DJ", icon: FaMusic },
      { id: "mc", name: "MC (Master of Ceremonies)", icon: FaMicrophone },
      { id: "magician", name: "Magician", icon: FaMagic },
      { id: "comedian", name: "Comedian", icon: FaSmile || FaStar }, // Fallback
      { id: "clown", name: "Clown", icon: FaSmile || FaStar }, // Fallback
      { id: "performer", name: "Performer", icon: FaStar }
    ]
  },
  {
    id: "photo_video",
    name: "Photographer/Videographer",
    icon: FaVideo,
    color: "from-red-500 to-orange-500",
    subcategories: [
      { id: "event_photographer", name: "Event Photographer", icon: FaCamera },
      { id: "portrait_photographer", name: "Portrait Photographer", icon: FaCamera },
      { id: "videographer", name: "Videographer", icon: FaVideo },
      { id: "video_editor", name: "Video Editor", icon: FaFilm || FaVideo }, // Fallback
      { id: "photo_editor", name: "Photo Editor", icon: FaImage || FaCamera }, // Fallback
      { id: "drone_operator", name: "Drone Operator", icon: FaPlane || FaCamera } // Fallback
    ]
  },
  {
    id: "office_work",
    name: "Office Work",
    icon: FaBriefcase,
    color: "from-gray-500 to-slate-500",
    subcategories: [
      { id: "admin_assistant", name: "Administrative Assistant", icon: FaUser },
      { id: "receptionist", name: "Receptionist", icon: FaConciergeBell },
      { id: "data_entry", name: "Data Entry Clerk", icon: FaKeyboard || FaFileAlt }, // Fallback
      { id: "customer_service", name: "Customer Service", icon: FaHeadset || FaPhone }, // Fallback
      { id: "office_manager", name: "Office Manager", icon: FaBriefcase },
      { id: "hr_assistant", name: "HR Assistant", icon: FaUserTie },
      { id: "accountant", name: "Accountant", icon: FaCalculator || FaFileAlt } // Fallback
    ]
  },
  {
    id: "beauty_service",
    name: "Beauty Service",
    icon: FaPalette,
    color: "from-pink-400 to-rose-400",
    subcategories: [
      { id: "makeup_artist", name: "Makeup Artist", icon: FaPalette },
      { id: "hair_stylist", name: "Hair Stylist", icon: FaCut },
      { id: "nail_technician", name: "Nail Technician", icon: FaHandSparkles || FaHandPaper || FaPalette }, // Fallback
      { id: "spa_therapist", name: "Spa Therapist", icon: FaSpa || FaStar }, // Fallback
      { id: "beauty_consultant", name: "Beauty Consultant", icon: FaUser }
    ]
  }
];

interface Profile {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;

  // Profession
  professionCategory: string;
  professionSubcategory: string;

  // Location
  nationality: string;
  country: string;
  city: string;
  area: string;
  openToWorkIn: string[];

  // Personal
  gender: string;
  dateOfBirth: string;
  languagesSpoken: string[];
  educationLevel: string;

  // Professional
  // jobType: string; // Removed as part of updates
  hasCar: boolean;
  hasLicense: boolean;
  hasHealthCard: boolean; // Keeping for reference or migration, but we will use hygiene below if needed or map it
  hasHygieneCertificate: boolean; // New specific
  hasOccupationalHealthCertificate: boolean; // New specific
  hasInsurance: boolean;
  healthIssues: string;

  introduction: string;
  previousExperience: string;
  eventsAttended: string;

  // Physical Attributes (for Entertainment/Modeling)
  height: string;
  weight: string;
  waist: string;
  hips: string;
  bust: string; // New
  trouserSize: string;
  shirtSize: string;
  dressSize: string;
  shoeSize: string;
  eyeColor: string;
  hairColor: string;
  skinColor: string;

  // Documents
  visaType: string;
  visaExpiry: string;
  passportExpiry: string;
  resumeUrl: string;

  // Media
  profileImageUrl: string;
  profilePhotos: string[];
  additionalPhotos: string[];
  linkedinUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;

  // Meta
  isProfileComplete: boolean;
}

function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [currentStep, setCurrentStep] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [profile, setProfile] = useState<Profile>({
    firstName: "", lastName: "", email: "", phoneNumber: "", whatsappNumber: "",
    professionCategory: "", professionSubcategory: "",
    nationality: "", country: "UAE", city: "", area: "", openToWorkIn: [],
    gender: "", dateOfBirth: "", languagesSpoken: [], educationLevel: "",
    hasCar: false, hasLicense: false, hasHealthCard: false,
    hasHygieneCertificate: false, hasOccupationalHealthCertificate: false, hasInsurance: false, healthIssues: "",
    introduction: "", previousExperience: "", eventsAttended: "",
    height: "", weight: "", waist: "", hips: "", bust: "", trouserSize: "", shirtSize: "",
    dressSize: "", shoeSize: "", eyeColor: "", hairColor: "", skinColor: "",
    visaType: "", visaExpiry: "", passportExpiry: "", resumeUrl: "",
    profileImageUrl: "", profilePhotos: [], additionalPhotos: [],
    linkedinUrl: "", instagramUrl: "", twitterUrl: "", facebookUrl: "",
    isProfileComplete: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as Partial<Profile>;

            // Ensure profilePhotos exists
            let photos = data.profilePhotos || [];
            if (photos.length === 0 && data.profileImageUrl) {
              photos = [data.profileImageUrl];
            }

            setProfile(prev => ({ ...prev, ...data, profilePhotos: photos }));
            if (data.professionCategory) setSelectedCategory(data.professionCategory);
            if (data.professionSubcategory) setSelectedSubcategory(data.professionSubcategory);
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
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (file: File, type: "image" | "photo" | "resume") => {
    if (!file) return;

    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (uploadPreset) formData.append("upload_preset", uploadPreset);
      formData.append("folder", "eventopic");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error('Cloudinary not configured');

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData
      );

      const url = res.data.secure_url;

      if (type === "image") {
        // Legacy support - update main image and first photo slot
        const newPhotos = [...profile.profilePhotos];
        newPhotos[0] = url;
        setProfile(prev => ({ ...prev, profileImageUrl: url, profilePhotos: newPhotos }));
        if (user) {
          await setDoc(doc(db, "users", user.uid), { profileImageUrl: url, profilePhotos: newPhotos }, { merge: true });
        }
      } else if (type === "resume") {
        setProfile(prev => ({ ...prev, resumeUrl: url }));
      } else {
        setProfile(prev => ({ ...prev, additionalPhotos: [...prev.additionalPhotos, url] }));
      }

      toast.success(`${type === "image" ? "Profile photo" : type === "resume" ? "Resume" : "Photo"} uploaded!`, { id: toastId });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(`Upload failed`, { id: toastId });
    }
  };

  const handleProfilePhotoUpload = async (file: File, index: number) => {
    if (!file) return;
    const toastId = toast.loading("Uploading photo...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (uploadPreset) formData.append("upload_preset", uploadPreset);
      formData.append("folder", "eventopic");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData
      );

      const url = res.data.secure_url;

      const newPhotos = [...profile.profilePhotos];
      // Fill empty slots if needed
      while (newPhotos.length < index) newPhotos.push("");
      newPhotos[index] = url;

      // Update state
      const updates: any = { profilePhotos: newPhotos };
      // If updating first photo, sync with main profileImageUrl
      if (index === 0) {
        updates.profileImageUrl = url;
      }

      setProfile(prev => ({ ...prev, ...updates }));

      // Auto-save to firebase just in case
      if (user) {
        await setDoc(doc(db, "users", user.uid), updates, { merge: true });
      }

      toast.success("Photo uploaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: toastId });
    }
  };

  const removeProfilePhoto = (index: number) => {
    const newPhotos = [...profile.profilePhotos];
    newPhotos.splice(index, 1);

    // If we removed the first one, update preview or set to empty
    const updates: any = { profilePhotos: newPhotos };
    if (index === 0) {
      updates.profileImageUrl = newPhotos[0] || "";
    } else if (newPhotos.length > 0 && index < newPhotos.length) {
      // logic ok
    }

    setProfile(prev => ({ ...prev, ...updates }));
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { ...profile, isProfileComplete: true }, { merge: true });
      toast.success("Profile saved successfully!");
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

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setProfile(prev => ({ ...prev, professionCategory: categoryId }));
    nextStep();
  };

  const selectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setProfile(prev => ({ ...prev, professionSubcategory: subcategoryId }));
    nextStep();
  };

  const addLanguage = (lang: string) => {
    if (lang && !profile.languagesSpoken.includes(lang)) {
      setProfile(prev => ({ ...prev, languagesSpoken: [...prev.languagesSpoken, lang] }));
    }
  };

  const removeLanguage = (lang: string) => {
    setProfile(prev => ({ ...prev, languagesSpoken: prev.languagesSpoken.filter(l => l !== lang) }));
  };

  const toggleWorkLocation = (location: string) => {
    setProfile(prev => ({
      ...prev,
      openToWorkIn: prev.openToWorkIn.includes(location)
        ? prev.openToWorkIn.filter(l => l !== location)
        : [...prev.openToWorkIn, location]
    }));
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="animate-spin w-16 h-16 border-t-4 border-[var(--primary)] rounded-full"></div>
    </div>;
  }

  // VIEW MODE
  if (!isEditMode && profile.isProfileComplete) {
    const category = PROFESSION_CATEGORIES.find(c => c.id === profile.professionCategory);
    const subcategory = category?.subcategories.find(s => s.id === profile.professionSubcategory);

    return (
      <>
        <Navbar />
        <section className="pt-28 pb-16 min-h-screen bg-[var(--background)]">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h1 className="text-5xl font-bold font-display gradient-text">{profile.firstName} {profile.lastName}</h1>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] mt-2 text-lg">
                  {subcategory?.icon && <subcategory.icon className="text-[var(--primary)]" />}
                  <span>{subcategory?.name || category?.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]/50"></span>
                  <span>{profile.city}, {profile.nationality}</span>
                </div>
              </div>
              <Link href="/profile?edit=true" className="btn-secondary px-6 py-2 flex items-center gap-2">
                <FaEdit /> Edit Profile
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Sidebar */}
              <div className="space-y-6">
                {/* Profile Photo Slider */}
                <div className="glass-card p-6 text-center">
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[var(--primary)] mb-4 shadow-lg shadow-[var(--primary)]/20 relative group bg-[var(--surface-elevated)]">
                    <AnimatePresence mode="wait">
                      {profile.profilePhotos && profile.profilePhotos.length > 0 ? (
                        <motion.div
                          key={currentPhotoIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="w-full h-full relative"
                        >
                          <Image
                            src={profile.profilePhotos[currentPhotoIndex]}
                            alt={`Profile ${currentPhotoIndex + 1}`}
                            width={192}
                            height={192}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--text-secondary)]">
                          {profile.firstName[0]}
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Slider Controls */}
                    {profile.profilePhotos && profile.profilePhotos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPhotoIndex(prev => prev === 0 ? profile.profilePhotos.length - 1 : prev - 1);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaChevronLeft size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPhotoIndex(prev => prev === profile.profilePhotos.length - 1 ? 0 : prev + 1);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaChevronRight size={16} />
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                          {profile.profilePhotos.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-[var(--primary)]' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-center gap-4 mt-6">
                    {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" className="p-2 rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"><FaLinkedin size={20} /></a>}
                    {profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" className="p-2 rounded-full bg-pink-600/10 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors"><FaInstagram size={20} /></a>}
                    {profile.twitterUrl && <a href={profile.twitterUrl} target="_blank" className="p-2 rounded-full bg-blue-400/10 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"><FaTwitter size={20} /></a>}
                    {profile.facebookUrl && <a href={profile.facebookUrl} target="_blank" className="p-2 rounded-full bg-blue-700/10 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors"><FaFacebook size={20} /></a>}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-lg"><FaUser className="text-[var(--primary)]" /> Contact Info</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--primary)]"><FaPhone /></div>
                      <div>
                        <div className="text-[var(--text-secondary)] text-xs">Phone</div>
                        <div className="font-semibold">{profile.phoneNumber}</div>
                      </div>
                    </div>
                    {(profile.whatsappNumber) && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center text-green-500"><FaPhone /></div>
                        <div>
                          <div className="text-[var(--text-secondary)] text-xs">WhatsApp</div>
                          <div className="font-semibold">{profile.whatsappNumber}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--primary)]"><FaUser /></div>
                      <div className="overflow-hidden">
                        <div className="text-[var(--text-secondary)] text-xs">Email</div>
                        <div className="font-semibold truncate" title={user?.email || ''}>{user?.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Stats */}
                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-lg"><FaIdCard className="text-[var(--primary)]" /> Personal & Documents</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[var(--border)] pb-2">
                      <span className="text-[var(--text-secondary)]">Nationality</span>
                      <span className="font-semibold">{profile.nationality || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border)] pb-2">
                      <span className="text-[var(--text-secondary)]">Education</span>
                      <span className="font-semibold">{profile.educationLevel || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border)] pb-2">
                      <span className="text-[var(--text-secondary)]">Gender</span>
                      <span className="font-semibold capitalize">{profile.gender || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border)] pb-2">
                      <span className="text-[var(--text-secondary)]">Date of Birth</span>
                      <span className="font-semibold">{profile.dateOfBirth || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border)] pb-2">
                      <span className="text-[var(--text-secondary)]">Visa Status</span>
                      <span className="font-semibold capitalize">{profile.visaType || '-'}</span>
                    </div>
                    {profile.visaExpiry && (
                      <div className="flex justify-between border-b border-[var(--border)] pb-2">
                        <span className="text-[var(--text-secondary)]">Visa Expiry</span>
                        <span className="font-semibold">{profile.visaExpiry}</span>
                      </div>
                    )}
                    {profile.passportExpiry && (
                      <div className="flex justify-between border-b border-[var(--border)] pb-2">
                        <span className="text-[var(--text-secondary)]">Passport Expiry</span>
                        <span className="font-semibold">{profile.passportExpiry}</span>
                      </div>
                    )}
                    {profile.resumeUrl && (
                      <div className="pt-2">
                        <a href={profile.resumeUrl} target="_blank" download className="btn-secondary w-full py-2 flex items-center justify-center gap-2 text-sm">
                          <FaFileDownload /> Download Resume
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Physical Attributes (Conditional) */}
                {(["model_influencer", "entertainer"].includes(profile.professionCategory) || profile.height || profile.weight) && (
                  <div className="glass-card p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg"><FaRuler className="text-[var(--primary)]" /> Measurements</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {profile.height && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Height</div>
                          <div className="font-bold">{profile.height} cm</div>
                        </div>
                      )}
                      {profile.weight && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Weight</div>
                          <div className="font-bold">{profile.weight} kg</div>
                        </div>
                      )}
                      {profile.bust && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Bust</div>
                          <div className="font-bold">{profile.bust} cm</div>
                        </div>
                      )}
                      {profile.waist && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Waist</div>
                          <div className="font-bold">{profile.waist} cm</div>
                        </div>
                      )}
                      {profile.hips && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Hips</div>
                          <div className="font-bold">{profile.hips} cm</div>
                        </div>
                      )}
                      {profile.dressSize && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Dress Size</div>
                          <div className="font-bold">{profile.dressSize}</div>
                        </div>
                      )}
                      {profile.trouserSize && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Trouser Size</div>
                          <div className="font-bold">{profile.trouserSize}</div>
                        </div>
                      )}
                      {profile.shirtSize && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Shirt Size</div>
                          <div className="font-bold">{profile.shirtSize}</div>
                        </div>
                      )}
                      {profile.shoeSize && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Shoe Size</div>
                          <div className="font-bold">{profile.shoeSize}</div>
                        </div>
                      )}
                      {profile.hairColor && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Hair</div>
                          <div className="font-bold">{profile.hairColor}</div>
                        </div>
                      )}
                      {profile.eyeColor && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Eyes</div>
                          <div className="font-bold">{profile.eyeColor}</div>
                        </div>
                      )}
                      {profile.skinColor && (
                        <div className="bg-[var(--surface-elevated)] p-3 rounded-lg text-center">
                          <div className="text-[var(--text-secondary)] text-xs">Skin</div>
                          <div className="font-bold">{profile.skinColor}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Main Content */}
              <div className="lg:col-span-2 space-y-6">

                {/* Introduction */}
                <div className="glass-card p-8">
                  <h3 className="font-bold text-xl mb-4 font-display flex items-center gap-2"><FaFileAlt className="text-[var(--primary)]" /> About Me</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-lg">
                    {profile.introduction || "No introduction added yet."}
                  </p>
                </div>

                {/* Professional Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><FaBriefcase className="text-[var(--primary)]" /> Professional Info</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[var(--text-secondary)] text-sm mb-1">Open To Work In</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.openToWorkIn.length > 0 ? profile.openToWorkIn.map(loc => (
                            <span key={loc} className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-sm">
                              {loc}
                            </span>
                          )) : <span className="text-[var(--text-secondary)]">Anywhere</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--text-secondary)] text-sm mb-1">Languages</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.languagesSpoken.length > 0 ? profile.languagesSpoken.map(lang => (
                            <span key={lang} className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-sm">
                              {lang}
                            </span>
                          )) : <span className="text-[var(--text-secondary)]">-</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><FaCheckCircle className="text-[var(--primary)]" /> Skills & Assets</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-elevated)]">
                        <div className="flex items-center gap-2">
                          <FaCar className={profile.hasCar ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"} />
                          <span className={profile.hasCar ? "font-bold" : "text-[var(--text-secondary)]"}>Owns Car</span>
                        </div>
                        {profile.hasCar && <FaCheckCircle className="text-[var(--primary)]" />}
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-elevated)]">
                        <div className="flex items-center gap-2">
                          <FaIdCard className={profile.hasLicense ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"} />
                          <span className={profile.hasLicense ? "font-bold" : "text-[var(--text-secondary)]"}>Driving License</span>
                        </div>
                        {profile.hasLicense && <FaCheckCircle className="text-[var(--primary)]" />}
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-elevated)]">
                        <div className="flex items-center gap-2">
                          <FaFileAlt className={profile.hasInsurance ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"} />
                          <span className={profile.hasInsurance ? "font-bold" : "text-[var(--text-secondary)]"}>Medical Insurance</span>
                        </div>
                        {profile.hasInsurance && <FaCheckCircle className="text-[var(--primary)]" />}
                      </div>
                    </div>
                  </div>

                  {/* Certificates - New Card */}
                  <div className="glass-card p-6 md:col-span-2">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><FaFileAlt className="text-[var(--primary)]" /> Certificates</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${profile.hasHealthCard ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                        <FaCheckCircle />
                        <span className="font-bold">Health Card</span>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${profile.hasHygieneCertificate ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                        <FaCheckCircle />
                        <span className="font-bold">Hygiene Certificate</span>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${profile.hasOccupationalHealthCertificate ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]' : 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                        <FaCheckCircle />
                        <span className="font-bold">Occupational Health</span>
                      </div>
                    </div>
                  </div>

                  {profile.healthIssues && (
                    <div className="glass-card p-6 md:col-span-2 border border-red-500/30 bg-red-500/5">
                      <h3 className="font-bold mb-2 flex items-center gap-2 text-red-500"><FaFileAlt /> Health Information</h3>
                      <p className="text-[var(--text-primary)]">{profile.healthIssues}</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }


  // WIZARD MODE - Profession Selection + Form
  const needsPhysicalAttributes = ["model_influencer", "entertainer"].includes(profile.professionCategory);

  const totalSteps = needsPhysicalAttributes ? 8 : 7;
  const steps = [
    "Category",
    "Profession",
    "Personal Info",
    "Location",
    "Languages & Documents",
    "Professional",
    ...(needsPhysicalAttributes ? ["Physical Attributes"] : []),
    "Media & Social"
  ];

  return (
    <>
      <Navbar />
      <section className="pt-28 pb-16 min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="container max-w-6xl mx-auto px-4">

          {/* Progress Bar */}
          {currentStep > 1 && (
            <div className="mb-8 max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[var(--text-secondary)]">Step {currentStep - 1} of {totalSteps - 2}</span>
                <span className="text-sm font-bold text-[var(--primary)]">{Math.round(((currentStep - 2) / (totalSteps - 2)) * 100)}%</span>
              </div>
              <div className="h-2 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500"
                  style={{ width: `${((currentStep - 2) / (totalSteps - 2)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* STEP 0: CATEGORY SELECTION & SEARCH */}
            {currentStep === 0 && (
              <motion.div
                key="category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center w-full"
              >
                <h1 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-4">Discover Your Path</h1>
                <p className="text-xl text-[var(--text-secondary)] mb-8">Search for your role or explore categories</p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-12 relative group z-10">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaSearch className="text-[var(--text-secondary)] group-focus-within:text-[var(--primary)] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search e.g. 'Model', 'Waiter', 'Photographer'..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none shadow-lg shadow-[var(--primary)]/5 transition-all text-lg"
                  />
                </div>

                {/* Subcategory Results (Search Mode) */}
                {searchQuery ? (
                  <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-4">
                      {PROFESSION_CATEGORIES.flatMap(cat => cat.subcategories.map(sub => ({ ...sub, categoryId: cat.id })))
                        .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((sub) => {
                          const Icon = sub.icon;
                          const category = PROFESSION_CATEGORIES.find(c => c.id === sub.categoryId);
                          return (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              onClick={() => {
                                setProfile(prev => ({ ...prev, professionCategory: sub.categoryId, professionSubcategory: sub.id }));
                                setSelectedCategory(sub.categoryId);
                                setSelectedSubcategory(sub.id);
                                setCurrentStep(2); // Jump to Personal Info
                              }}
                              className="bg-[var(--surface)] border border-[var(--border)] px-6 py-4 rounded-2xl cursor-pointer flex items-center gap-3 hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/10 transition-all"
                            >
                              <Icon className={`text-2xl text-[var(--primary)]`} />
                              <div className="text-left">
                                <div className="font-bold">{sub.name}</div>
                                <div className="text-xs text-[var(--text-secondary)]">{category?.name}</div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                    {PROFESSION_CATEGORIES.flatMap(cat => cat.subcategories).filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="text-[var(--text-secondary)] mt-8">No specific roles found. Try browsing categories below.</div>
                    )}
                  </div>
                ) : (
                  /* Categories Grid (Browse Mode) */
                  <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-6">
                      {PROFESSION_CATEGORIES.map((category, idx) => {
                        const Icon = category.icon;
                        return (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectCategory(category.id)}
                            className="bg-[var(--surface-elevated)] p-6 rounded-3xl cursor-pointer group hover:bg-gradient-to-br hover:from-[var(--surface)] hover:to-[var(--surface-elevated)] border-2 border-transparent hover:border-[var(--primary)]/20 transition-all flex flex-col items-center min-w-[160px]"
                          >
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                              <Icon className="text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold font-display">{category.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{category.subcategories.length} roles</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 1: SUBCATEGORY SELECTION */}
            {currentStep === 1 && selectedCategory && (
              <motion.div
                key="subcategory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center w-full"
              >
                {(() => {
                  const category = PROFESSION_CATEGORIES.find(c => c.id === selectedCategory);
                  if (!category) return null;

                  return (
                    <>
                      <button onClick={prevStep} className="btn-secondary mb-8 px-6 py-2 flex items-center gap-2 mx-auto rounded-full">
                        <FaArrowLeft /> Back to Categories
                      </button>

                      <h1 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-4">Select Your Profession</h1>
                      <p className="text-xl text-[var(--text-secondary)] mb-12">What specific role do you excel at?</p>

                      <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-4">
                          {category.subcategories.map((sub, idx) => {
                            const Icon = sub.icon;
                            return (
                              <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => selectSubcategory(sub.id)}
                                className="bg-[var(--surface-elevated)] px-8 py-4 rounded-full cursor-pointer group border border-transparent hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/10 transition-all flex items-center gap-3"
                              >
                                <Icon className="text-2xl text-[var(--primary)] group-hover:scale-110 transition-transform" />
                                <h4 className="font-bold text-lg">{sub.name}</h4>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* STEP 2: PERSONAL INFO */}
            {currentStep === 2 && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-card p-8 rounded-3xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display gradient-text">Personal Information</h2>
                    <p className="text-[var(--text-secondary)] mt-2">Let's get to know you better</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaUser className="text-[var(--primary)]" /> First Name
                      </label>
                      <input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="John"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold">Last Name</label>
                      <input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaPhone className="text-[var(--primary)]" /> Phone Number
                      </label>
                      <input
                        name="phoneNumber"
                        value={profile.phoneNumber}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="+971 50 000 0000"
                      />
                      <p className="text-xs text-[var(--text-secondary)]">Start with +971 for UAE</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold">WhatsApp Number</label>
                      <input
                        name="whatsappNumber"
                        value={profile.whatsappNumber}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="+971 50 000 0000"
                      />
                      <p className="text-xs text-[var(--text-secondary)]">Start with +971 for UAE</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaGlobe className="text-[var(--primary)]" /> Nationality
                      </label>
                      <select
                        name="nationality"
                        value={profile.nationality}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                      >
                        <option value="">Select Nationality</option>
                        {["UAE", "India", "Pakistan", "Philippines", "Egypt", "UK", "USA", "Canada", "Lebanon", "Jordan", "Syria", "Other"].map(nat => (
                          <option key={nat} value={nat}>{nat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaGraduationCap className="text-[var(--primary)]" /> Education Level
                      </label>
                      <select
                        name="educationLevel"
                        value={profile.educationLevel}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                      >
                        <option value="">Select Education</option>
                        {EDUCATION_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaVenusMars className="text-[var(--primary)]" /> Gender
                      </label>
                      <select
                        name="gender"
                        value={profile.gender}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaCalendar className="text-[var(--primary)]" /> Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={handleInputChange}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
                    <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                      <FaArrowLeft /> Back
                    </button>
                    <button onClick={nextStep} className="btn-primary px-8 py-2 flex items-center gap-2">
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LOCATION */}
            {currentStep === 3 && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-card p-8 rounded-3xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display gradient-text">Location & Preferences</h2>
                    <p className="text-[var(--text-secondary)] mt-2">Where are you based and where can you work?</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[var(--primary)]" /> City
                        </label>
                        <select
                          name="city"
                          value={profile.city}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select City</option>
                          {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Area</label>
                        <input
                          name="area"
                          value={profile.area}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                          placeholder="e.g., Dubai Marina"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaGlobe className="text-[var(--primary)]" /> Open to Work In
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "Umm Al Quwain"].map(loc => (
                          <div
                            key={loc}
                            onClick={() => toggleWorkLocation(loc)}
                            className={`p-3 rounded-xl border-2 cursor-pointer text-center transition-all ${profile.openToWorkIn.includes(loc)
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                              }`}
                          >
                            <span className="font-bold text-sm">{loc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobility / Car - Moved here */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                        <input
                          type="checkbox"
                          name="hasCar"
                          checked={profile.hasCar}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[var(--primary)]"
                        />
                        <div className="flex items-center gap-2">
                          <FaCar className="text-[var(--primary)]" />
                          <span className="font-bold">I have a car</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                        <input
                          type="checkbox"
                          name="hasLicense"
                          checked={profile.hasLicense}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[var(--primary)]"
                        />
                        <div className="flex items-center gap-2">
                          <FaIdCard className="text-[var(--primary)]" />
                          <span className="font-bold">I have a driving license</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
                    <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                      <FaArrowLeft /> Back
                    </button>
                    <button onClick={nextStep} className="btn-primary px-8 py-2 flex items-center gap-2">
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: LANGUAGES & DOCUMENTS & RESUME */}
            {currentStep === 4 && (
              <motion.div
                key="languages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-card p-8 rounded-3xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display gradient-text">Languages, Documents & Resume</h2>
                    <p className="text-[var(--text-secondary)] mt-2">Your skills, certifications, and CV</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaLanguage className="text-[var(--primary)]" /> Languages Spoken
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Add a language..."
                          className="modern-input flex-1 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addLanguage((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.languagesSpoken.map(lang => (
                          <span key={lang} className="px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center gap-2 text-sm font-bold">
                            {lang}
                            <FaTimes className="cursor-pointer hover:text-red-500" onClick={() => removeLanguage(lang)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resume Upload Section */}
                    <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center">
                      <label className="block text-sm font-bold mb-3 flex items-center justify-center gap-2">
                        <FaFileAlt className="text-[var(--primary)]" /> Upload Resume / CV (Optional)
                      </label>
                      <div className="flex flex-col items-center justify-center">
                        {profile.resumeUrl ? (
                          <div className="flex items-center gap-3 bg-[var(--surface-elevated)] px-4 py-2 rounded-lg border border-[var(--primary)]">
                            <FaCheckCircle className="text-green-500" />
                            <span className="text-sm font-semibold text-[var(--primary)]">Resume Uploaded</span>
                            <button onClick={() => setProfile(prev => ({ ...prev, resumeUrl: "" }))} className="text-[var(--text-secondary)] hover:text-red-500 ml-2">
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--primary)] group-hover:scale-110 transition-all border-2 border-dashed border-[var(--text-secondary)] group-hover:border-[var(--primary)] mb-2 mx-auto">
                              <FaCloudUploadAlt className="text-2xl" />
                            </div>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">Click to upload PDF or Doc</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(e.target.files?.[0]!, "resume")}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Certificates Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaFileAlt className="text-[var(--primary)]" /> Certificates
                      </label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                          <input
                            type="checkbox"
                            name="hasHealthCard"
                            checked={profile.hasHealthCard}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[var(--primary)]"
                          />
                          <span className="text-sm font-medium">Valid Health Card</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                          <input
                            type="checkbox"
                            name="hasHygieneCertificate"
                            checked={profile.hasHygieneCertificate}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[var(--primary)]"
                          />
                          <span className="text-sm font-medium">Hygiene Certificate</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                          <input
                            type="checkbox"
                            name="hasOccupationalHealthCertificate"
                            checked={profile.hasOccupationalHealthCertificate}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[var(--primary)]"
                          />
                          <span className="text-sm font-medium">Occupational Health Card</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaPassport className="text-[var(--primary)]" /> Visa Type
                        </label>
                        <select
                          name="visaType"
                          value={profile.visaType}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Visa Type</option>
                          {VISA_TYPES.map(visa => (
                            <option key={visa} value={visa}>{visa}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Visa Expiry Date</label>
                        <input
                          type="date"
                          name="visaExpiry"
                          value={profile.visaExpiry}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Passport Expiry Date</label>
                        <input
                          type="date"
                          name="passportExpiry"
                          value={profile.passportExpiry}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaFileAlt className="text-[var(--primary)]" /> Medical Insurance
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all">
                          <input
                            type="checkbox"
                            name="hasInsurance"
                            checked={profile.hasInsurance}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-[var(--primary)]"
                          />
                          <span className="font-bold text-sm">I have valid medical insurance</span>
                        </label>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-bold flex items-center gap-2 text-red-500">
                          Disability / Allergy / Health Problem
                        </label>
                        <textarea
                          name="healthIssues"
                          value={profile.healthIssues}
                          onChange={handleInputChange}
                          rows={2}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                          placeholder="Please mention if any..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
                    <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                      <FaArrowLeft /> Back
                    </button>
                    <button onClick={nextStep} className="btn-primary px-8 py-2 flex items-center gap-2">
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: PROFESSIONAL DETAILS */}
            {currentStep === 5 && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-card p-8 rounded-3xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display gradient-text">Professional Details</h2>
                    <p className="text-[var(--text-secondary)] mt-2">Tell us about your experience</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaUser className="text-[var(--primary)]" /> Introduction
                      </label>
                      <textarea
                        name="introduction"
                        value={profile.introduction}
                        onChange={handleInputChange}
                        rows={4}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="Introduce yourself to potential employers..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaBriefcase className="text-[var(--primary)]" /> Previous Experience
                      </label>
                      <textarea
                        name="previousExperience"
                        value={profile.previousExperience}
                        onChange={handleInputChange}
                        rows={4}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="List your previous work experience, companies, roles..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <FaStar className="text-[var(--primary)]" /> Events Attended Before
                      </label>
                      <textarea
                        name="eventsAttended"
                        value={profile.eventsAttended}
                        onChange={handleInputChange}
                        rows={3}
                        className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        placeholder="Name of the event, Location, Position"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
                    <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                      <FaArrowLeft /> Back
                    </button>
                    <button onClick={nextStep} className="btn-primary px-8 py-2 flex items-center gap-2">
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: PHYSICAL ATTRIBUTES (Conditional) */}
            {needsPhysicalAttributes && currentStep === 6 && (
              <motion.div
                key="physical"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="glass-card p-8 rounded-3xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display gradient-text">Physical Attributes</h2>
                    <p className="text-[var(--text-secondary)] mt-2">Required for entertainer and modeling roles</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaRuler className="text-[var(--primary)]" /> Height (cm)
                        </label>
                        <select
                          name="height"
                          value={profile.height}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select</option>
                          {Array.from({ length: 61 }, (_, i) => 140 + i).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaWeight className="text-[var(--primary)]" /> Weight (kg)
                        </label>
                        <select
                          name="weight"
                          value={profile.weight}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select</option>
                          {Array.from({ length: 91 }, (_, i) => 40 + i).map(w => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Bust (cm)</label>
                        <input
                          name="bust"
                          value={profile.bust}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                          placeholder="e.g. 90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Waist (cm)</label>
                        <input
                          name="waist"
                          value={profile.waist}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                          placeholder="e.g. 60"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Hips (cm)</label>
                        <input
                          name="hips"
                          value={profile.hips}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                          placeholder="e.g. 90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaTshirt className="text-[var(--primary)]" /> Shirt Size
                        </label>
                        <select
                          name="shirtSize"
                          value={profile.shirtSize}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Size</option>
                          {SHIRT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Trouser Size</label>
                        <select
                          name="trouserSize"
                          value={profile.trouserSize}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Size</option>
                          {TROUSER_SIZES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold">Dress Size</label>
                        <select
                          name="dressSize"
                          value={profile.dressSize}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Size</option>
                          {DRESS_SIZES.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaShoePrints className="text-[var(--primary)]" /> Shoe Size (EU)
                        </label>
                        <select
                          name="shoeSize"
                          value={profile.shoeSize}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Size</option>
                          {SHOE_SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaEye className="text-[var(--primary)]" /> Eye Color
                        </label>
                        <select
                          name="eyeColor"
                          value={profile.eyeColor}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Color</option>
                          {EYE_COLORS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaPaintBrush className="text-[var(--primary)]" /> Skin Color
                        </label>
                        <select
                          name="skinColor"
                          value={profile.skinColor}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Color</option>
                          {SKIN_COLORS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <FaCut className="text-[var(--primary)]" /> Hair Color
                        </label>
                        <select
                          name="hairColor"
                          value={profile.hairColor}
                          onChange={handleInputChange}
                          className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                        >
                          <option value="">Select Color</option>
                          {HAIR_COLORS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>


                  <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
                    <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                      <FaArrowLeft /> Back
                    </button>
                    <button onClick={nextStep} className="btn-primary px-8 py-2 flex items-center gap-2">
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div >
              </motion.div >
            )
            }

            {/* STEP 7/6: MEDIA & SOCIAL */}
            {
              currentStep === (needsPhysicalAttributes ? 7 : 6) && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-3xl mx-auto"
                >
                  <div className="glass-card p-8 rounded-3xl">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold font-display gradient-text">Media & Social Links</h2>
                      <p className="text-[var(--text-secondary)] mt-2">Showcase your work and connect with employers</p>
                    </div>

                    <div className="space-y-6">
                      <div className="text-center">
                        <label className="block text-sm font-bold mb-4 flex items-center justify-center gap-2">
                          <FaCamera className="text-[var(--primary)]" /> Profile Photos
                        </label>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">Add up to 3 photos. The first one will be your main avatar.</p>

                        <div className="flex justify-center gap-4 mb-2">
                          {[0, 1, 2].map((index) => (
                            <div key={index} className="relative">
                              <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all relative group ${index === 0 ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20' : 'border-dashed border-[var(--border)] hover:border-[var(--primary)]'
                                }`}>
                                {profile.profilePhotos[index] ? (
                                  <>
                                    <Image
                                      src={profile.profilePhotos[index]}
                                      alt={`Profile ${index + 1}`}
                                      width={112}
                                      height={112}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <label className="cursor-pointer text-white hover:text-[var(--primary)] p-1">
                                        <FaEdit />
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0]!, index)}
                                          className="hidden"
                                        />
                                      </label>
                                      <button
                                        onClick={() => removeProfilePhoto(index)}
                                        className="text-white hover:text-red-500 p-1"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                                    <div className="bg-[var(--surface)] p-2 rounded-full mb-1">
                                      <FaCamera size={16} />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">
                                      {index === 0 ? "Main" : "Add"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0]!, index)}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                              {index === 0 && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                  MAIN
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-center">Social Links</h3>

                        <div className="space-y-2">
                          <label className="text-sm font-bold flex items-center gap-2">
                            <FaLinkedin className="text-blue-600" /> LinkedIn
                          </label>
                          <input
                            name="linkedinUrl"
                            value={profile.linkedinUrl}
                            onChange={handleInputChange}
                            className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold flex items-center gap-2">
                            <FaInstagram className="text-pink-600" /> Instagram
                          </label>
                          <input
                            name="instagramUrl"
                            value={profile.instagramUrl}
                            onChange={handleInputChange}
                            className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                            placeholder="https://instagram.com/yourhandle"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold flex items-center gap-2">
                            <FaTwitter className="text-blue-400" /> X (Twitter)
                          </label>
                          <input
                            name="twitterUrl"
                            value={profile.twitterUrl}
                            onChange={handleInputChange}
                            className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                            placeholder="https://x.com/yourhandle"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold flex items-center gap-2">
                            <FaFacebook className="text-blue-700" /> Facebook
                          </label>
                          <input
                            name="facebookUrl"
                            value={profile.facebookUrl}
                            onChange={handleInputChange}
                            className="modern-input w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                            placeholder="https://facebook.com/yourprofile"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border)]">
                      <button onClick={prevStep} className="btn-secondary px-6 py-2 flex items-center gap-2">
                        <FaArrowLeft /> Back
                      </button>
                      <button onClick={saveProfile} disabled={saving} className="btn-primary px-8 py-2 flex items-center gap-2 disabled:opacity-70">
                        {saving ? "Saving..." : "Complete Profile"} <FaCheckCircle />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            }

          </AnimatePresence >
        </div >
      </section >
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
