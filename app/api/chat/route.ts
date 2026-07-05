import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// ─── Firebase Client Init (server-side) ───────────────────────────────────────
function getServerDb() {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getFirestore(app);
}

// ─── OpenAI ──────────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const requestMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = requestMap.get(ip);
    if (!record || now > record.resetTime) {
        requestMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }
    if (record.count >= RATE_LIMIT) return false;
    record.count++;
    return true;
}

// ─── Job Types ────────────────────────────────────────────────────────────────
interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    duration: string;
    rate: number;
    paymentFrequency?: string;
    description?: string;
    category: string;
}

// Cache jobs for 2 minutes so we don't hit Firestore on every message
let jobCache: { jobs: Job[]; fetchedAt: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000;

async function fetchJobs(): Promise<Job[]> {
    if (jobCache && Date.now() - jobCache.fetchedAt < CACHE_TTL) {
        return jobCache.jobs;
    }
    try {
        const db = getServerDb();
        const snapshot = await getDocs(collection(db, "jobs"));
        const jobs: Job[] = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
                id: doc.id,
                title: d.title || "Untitled Job",
                location: d.location || "Dubai, UAE",
                type: d.type || "Event",
                duration: d.duration || "1 Day",
                rate: Number(d.rate) || 0,
                paymentFrequency: d.paymentFrequency || "Day",
                description: d.description || "",
                category: d.category || "other",
            };
        });
        jobCache = { jobs, fetchedAt: Date.now() };
        return jobs;
    } catch (error) {
        console.error("Chatbot: Failed to fetch jobs from Firestore:", error);
        return [];
    }
}

// ─── Context Builder ──────────────────────────────────────────────────────────
function buildJobsContext(jobs: Job[]): string {
    if (jobs.length === 0) {
        return "**Live Jobs:** There are currently no active job listings. New jobs are added frequently — check back soon or visit /jobs.";
    }

    const categoryLabels: Record<string, string> = {
        staffing: "Staffing (Hostesses, Ushers, Coordinators)",
        models_entertainment: "Models & Entertainment",
        promotions: "Promotions & Brand",
        other: "Other Roles",
    };

    // Group by category
    const grouped: Record<string, Job[]> = {};
    jobs.forEach((job) => {
        const cat = job.category || "other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(job);
    });

    let context = `## 🔴 LIVE JOB LISTINGS — ${jobs.length} Active Jobs Right Now\n`;
    context += `(This is real-time data from our platform — always reference these exact listings)\n\n`;

    Object.entries(grouped).forEach(([cat, catJobs]) => {
        context += `### ${categoryLabels[cat] || cat} — ${catJobs.length} job${catJobs.length !== 1 ? "s" : ""}\n`;
        catJobs.forEach((job) => {
            context += `- **${job.title}** | 📍 ${job.location} | ⏱ ${job.type}, ${job.duration} | 💰 AED ${job.rate}/${job.paymentFrequency || "Day"}`;
            if (job.description) {
                const shortDesc = job.description.slice(0, 120);
                context += ` — ${shortDesc}${job.description.length > 120 ? "…" : ""}`;
            }
            context += "\n";
        });
        context += "\n";
    });

    return context;
}

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(jobsContext: string): string {
    return `You are **Eventopic AI** — a warm, honest and helpful assistant for Eventopic, a UAE event staffing agency. Be friendly and concise. Never exaggerate or invent facts, clients, or numbers.

## About Eventopic
Eventopic is an event staffing agency supplying professional, well-presented and reliable staff for events, exhibitions, brand activations and private gatherings across the UAE. Good staffing is not only about appearance — we select for attitude, accountability and how people represent a brand. We handle sourcing, screening, briefing and on-site coordination — for job seekers and for clients who need reliable staff.
Website: www.eventopic.com

## Site Pages You Can Direct Users To
- **/jobs** — Browse ALL live jobs (filterable by category)
- **/jobs/[jobId]** — Apply to a specific job directly
- **/profile** — Build your professional profile (required before applying)  
- **/dashboard** — Track your applications and status
- **/services** — See what staffing solutions we offer
- **/contact** — Contact the team or submit a client inquiry
- **/about** — Company background and values

## Roles on Our Platform
Hostesses, VIP Hostesses, Ushers, Greeters, Receptionists, Registration Staff, Promoters, Sales Promoters, Brand Ambassadors, Sampling Staff, Lead Generators, Models, Promotional Models, Fashion Models, Exhibition Staff, Event Support Staff, Hospitality Staff, Customer Service Representatives, Temporary Corporate Staff, Stand Speakers, MCs/Anchors, Event Coordinators, Team Leaders, Supervisors, Security Staff.
We do NOT provide DJs, bartenders, dancers, waiters or baristas — if asked, say those roles are outside our scope and suggest /contact for anything unusual.

## Job Categories Explained
- **staffing** → Hostesses, Ushers, Greeters, Registration, Coordinators
- **models_entertainment** → Models, Promotional & Fashion Models
- **promotions** → Promoters, Brand Ambassadors, Sales/Sampling Staff
- **other** → Miscellaneous specialist roles

## For Job Seekers
- First: complete your profile at /profile (photos, Emirates ID, experience)
- Then: browse and apply at /jobs
- Payment: AED-based, timely direct transfers
- Support & job applications: hiring@eventopic.com or Instagram DM (@eventopic_official)

## For Clients (Businesses)
- Email: info@eventopic.com
- Instagram: @eventopic_official
- Contact form: /contact
- We staff events, exhibitions, expos, trade shows, real estate kiosks, brand activations, corporate promotions, mall activations, product launches, marketing campaigns and private gatherings
- Our client process: brief received (day 1) → profiles screened (days 1–5) → client introduction (days 5–7) → team prepared after contract → event delivery → post-event feedback

## Our promise (you can quote these)
- For clients: legal and compliant staffing, responsible team management, professional profiles (trained when needed), a smooth post-event experience
- For staff: a transparent and equal rate, proper contract and permit, key details ahead of time, a direct point of contact, payment within 14 days

## About the company (be honest, never exaggerate)
- A young UAE event staffing network that has actually worked the floor — built in 2025, covering all 7 emirates, 30+ role types
- Built with Newlink Business Group, our sister company and trusted UAE partner (established 2010, 15+ years in the UAE) — right paperwork, legal guidance, responsible approach
- Clients we've worked with include Newlink, Go & Grab and Nazsats
- Honest pay in AED, no hidden fees
- If you don't know something, say so and point them to /contact or info@eventopic.com

## Contact
- Job applications (talent): hiring@eventopic.com
- Business enquiries (clients): info@eventopic.com
- Location: International City, CBD 05, Office No. 8, Dubai, UAE
- Hours: Mon–Fri 9am–6pm (24/7 support available)
- Instagram: @eventopic_official
- LinkedIn: linkedin.com/company/eventopic

---

${jobsContext}

---

## YOUR BEHAVIOR RULES (Follow strictly)

1. **Job questions → Use the live data above.** 
   - "How many model jobs?" → Count jobs in models_entertainment category and give the exact number + list them.
   - "I'm a promoter, show me jobs" → Find all jobs in promotions category, list each with title, location, rate. Tell them to apply at /jobs.
   - "Any hostess jobs in Dubai Marina?" → Filter by title/location from the listings above.
   - NEVER say you don't have access to job listings — you DO (they are listed above).

2. **Be a proactive career guide.** 
   - If someone shares their profession/role, immediately match them to relevant open jobs.
   - Suggest they also complete their profile at /profile if they haven't.
   - Mention that new jobs are added frequently even if current listings are limited.

3. **Response format:**
   - Keep it concise and visually clean — use bullet points, bold text for important info.
   - For job listings, always show: **Job Title** | 📍 Location | 💰 AED Rate/Period
   - End every response with a clear next step (link to apply, offer more help, etc.)

4. **Client inquiries** → Ask about the type of occasion (exhibition, activation, kiosk, promotion…), dates and number of staff needed, then direct to info@eventopic.com or /contact.

5. **Never fabricate jobs** that are not in the Live Listings above. If a category is empty, be honest and suggest they visit /jobs for updates.

6. **For off-topic questions**, kindly redirect: "I'm here to help with Eventopic's jobs and services!"`;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                { status: 429 }
            );
        }

        const body = await req.json().catch(() => null);
        const messages = body?.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Validate shape and cap sizes to bound OpenAI cost / abuse.
        const MAX_MSG_CHARS = 2000;
        const MAX_TOTAL_CHARS = 12000;
        const cleanMessages: { role: "user" | "assistant"; content: string }[] = [];
        let totalChars = 0;
        for (const m of messages.slice(-20)) {
            if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
                return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
            }
            const content = m.content.slice(0, MAX_MSG_CHARS);
            totalChars += content.length;
            if (totalChars > MAX_TOTAL_CHARS) break;
            cleanMessages.push({ role: m.role, content });
        }
        if (cleanMessages.length === 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Fetch live jobs from Firestore (2-min cache)
        const jobs = await fetchJobs();
        const jobsContext = buildJobsContext(jobs);
        const systemPrompt = buildSystemPrompt(jobsContext);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...cleanMessages,
            ],
            temperature: 0.6,
            max_tokens: 700,
        });

        const reply =
            completion.choices[0]?.message?.content ||
            "Sorry, I couldn't generate a response. Please try again.";

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        console.error("Chat API error:", error);
        const isOpenAIError =
            error && typeof error === "object" && "status" in error;
        if (isOpenAIError && (error as { status: number }).status === 401) {
            return NextResponse.json(
                { error: "API configuration error." },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "An error occurred. Please try again." },
            { status: 500 }
        );
    }
}

