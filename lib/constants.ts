// lib/constants.ts
// Single source of truth for the app's shared enums. The job "category"
// (the broad group) is deliberately separate from the job "role/title"
// (the specific position), which fixes the mismatch between the admin
// form, the job filters, and the chatbot grouping.

export const JOB_CATEGORIES = [
  { id: "staffing", label: "Staffing", blurb: "Hostesses, Ushers, Greeters, Registration, Coordinators" },
  { id: "models_entertainment", label: "Models", blurb: "Models, Promotional & Fashion Models" },
  { id: "promotions", label: "Promotions & Brand", blurb: "Promoters, Brand Ambassadors, Sales/Sampling Staff" },
  { id: "hospitality", label: "Hospitality & F&B", blurb: "Hospitality, F&B & Guest Service Staff" },
  { id: "creative", label: "Creative & Media", blurb: "Photographers, Videographers, Editors, Designers" },
  { id: "corporate", label: "Corporate & Office", blurb: "Admin, Reception, Customer Service, Operations" },
  { id: "other", label: "Other Roles", blurb: "Specialist and miscellaneous roles" },
] as const;

export type JobCategoryId = (typeof JOB_CATEGORIES)[number]["id"];

export const JOB_CATEGORY_IDS: JobCategoryId[] = JOB_CATEGORIES.map((c) => c.id);

export const JOB_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  JOB_CATEGORIES.map((c) => [c.id, c.label])
);

// UAE emirates — used for job locations and "open to work in" preferences.
export const UAE_EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
] as const;

export const PAYMENT_FREQUENCIES = [
  { id: "hourly", label: "Hourly" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "project", label: "Per Project" },
  { id: "annual", label: "Annual" },
] as const;
