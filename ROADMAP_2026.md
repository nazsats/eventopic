# Eventopic — Upscaling Roadmap 2026

**Date:** 14 June 2026
**Context:** Live startup with an existing community. Goal: modernise the product, deepen the UAE event-staffing niche, then layer SEO/social/growth on top.
**Companion doc:** technical/security findings live in **[PROJECT_REVIEW_2026.md](PROJECT_REVIEW_2026.md)** — fix Phase 0 there *before* chasing growth, because a data breach during a growth push is the worst possible time.

> A note on the numbers below: the market figures are directional, based on the structure of the UAE events economy (Expo legacy, year-round exhibitions at DWTC/ADNEC, tourism-driven hospitality, Vision 2031). Before you put any stat on the website, verify it against a current source (DET, DWTC reports, recruver/Bayt/GMI market reports). Don't publish "500+ professionals / 50+ clients" type claims unless they're true — UAE advertising rules (and trust) punish inflated claims.

---

## 1. The market you're actually in (Dubai / UAE event staffing)

### 1.1 Why the niche is good
- **Always-on event calendar.** Dubai runs exhibitions, conferences, product launches, fashion shows, sporting events and government functions essentially every week of the year. Demand for hostesses, promoters, ushers, registration staff and brand ambassadors is structural, not seasonal.
- **Tourism + retail engine.** Dubai Shopping Festival, GITEX, Gulfood, Arab Health, ADIPEC, Dubai Airshow, art/fashion weeks — each pulls in hundreds of temporary staff per event.
- **Fragmented supply side.** Talent is spread across Instagram DMs, WhatsApp groups, and a handful of agencies. A clean two-sided platform that *vets* and *deploys* fast is a real wedge.

### 1.2 The two customer types (build for both, separately)
1. **Clients / event organisers (the payers).** They care about: speed (staff in 24–48h), reliability, vetting, professional appearance, English/Arabic fluency, and invoicing/compliance. Your "hire" flow and `/contact` lead capture serve them.
2. **Talent / job seekers (the supply, your community).** Promoters, models, hostesses, MCs, dancers, photographers, students on visit/student visas, etc. They care about: getting paid on time, finding gigs fast, a profile that shows them off, and clarity on requirements (Emirates ID, visa type).

These have **opposite** needs — don't make one page try to serve both. Today the chatbot prompt and homepage blur them.

### 1.3 UAE-specific things the product must respect
- **Work authorisation & visa types.** You already collect visa type/expiry — good. Many gig workers are on visit/student/freelance/golden visas with different legal rights to work. Surface this clearly and *never* facilitate illegal work; it's a license and reputational risk. Consider a short compliance note.
- **Data protection (UAE PDPL, effective and enforced).** You hold names, phone numbers, photos, passport/visa expiry, body measurements, health notes. That's sensitive personal data. You need: a real privacy policy, a lawful basis for processing, data-retention limits, and a deletion path. (See §4.)
- **Bilingual reality.** Arabic + English. Even partial Arabic support and Arabic-friendly name handling (see review §2.3) signals legitimacy.
- **Payments.** AED, fast payouts are the talent's #1 concern. Payment rails (even just tracked manual payouts at first) are a future differentiator.
- **WhatsApp is the channel.** In the UAE, WhatsApp beats email for both talent and SME clients. Lean into it.

---

## 2. Product roadmap (phased)

Each phase assumes the previous one's security/foundation work is done.

### Phase A — Foundation & trust (Weeks 1–4)
*Prerequisite: PROJECT_REVIEW_2026.md Phase 0 + Phase 1.*
- Correct, strict Firestore rules; PII locked down. **(blocking)**
- Privacy policy + terms that actually match what you collect (you have `/privacy` and `/terms` pages — make them real and PDPL-aware).
- "Delete my account & data" flow for talent. Builds trust *and* is a compliance requirement.
- Email verification enforced before applying (review §2.7).
- Canonical category taxonomy (review §2.2) so search/filter/chatbot agree.

### Phase B — Talent experience (Weeks 4–10)
- **Application status tracking** that's real-time for the applicant (you have `/dashboard` — make sure it reflects accepted/rejected/pending and notifies).
- **WhatsApp notifications** on application status changes and new matching jobs (WhatsApp Business API or a provider like Twilio).
- **Smart job matching**: surface jobs to talent based on their profession category, location, and availability — the data is already in the profile.
- **Profile completeness nudges** and a "verified" badge once Emirates ID / docs are checked (vetting is your value-add — make it visible).
- **Portfolio polish**: you already support multiple photos + CV; add video reels (big for models/MCs/dancers) via Cloudinary video.

### Phase C — Client experience & monetisation (Weeks 10–18)
- **Self-serve staffing request** with structured fields (event type, date, # of staff, roles, languages, dress code, budget) instead of a generic contact form — this is the conversion engine.
- **Talent shortlisting**: let a client browse a *curated, privacy-safe* talent gallery (NOT raw `users` docs — a separate public profile projection) and request specific people.
- **Quoting / booking workflow** and an internal CRM view (your leads page is the seed of this).
- **Monetisation options to test**: placement fee per booking, client subscription for priority/volume, or a margin on payouts. Pick one; instrument it.

### Phase D — Scale & intelligence (Month 5+)
- **Ratings & reliability scores** (client rates talent after each gig; no-shows tracked) — this becomes your moat.
- **AI matching** beyond keyword: use the OpenAI integration you already have to rank talent against a job brief.
- **Analytics dashboard** for admins: fill rate, time-to-fill, repeat-client rate, top roles by demand.
- **Multi-city** (Abu Dhabi, Sharjah) — the location data model already supports it.

---

## 3. Technical modernisation

Your stack is already current (Next 16, React 19, Tailwind 4) — that's a strong base. Upgrades that pay off as you scale:

| Area | Now | Recommended |
|------|-----|-------------|
| **Data security** | Client writes + (suspect) rules | Strict rules + custom claims for roles (review §1.1) |
| **Rate limiting** | In-memory (ineffective on Vercel) | Upstash Redis (env already stubbed) |
| **Background jobs** | None | Vercel Cron / Firebase Functions for notifications, lead enrichment, doc-expiry reminders |
| **Search** | Client-side `.filter()` over full collections | Server pagination now; Algolia/Typesense when talent > a few thousand |
| **Error/monitoring** | `console.error` | Sentry (errors) + Vercel Analytics (already added) + a logflare/logtail sink |
| **Testing** | None visible | Add Vitest for `lib/` (validation, rate limit) and Playwright for the apply + admin flows before you move fast |
| **Notifications** | Toasts only | Transactional email (Resend) + WhatsApp Business API |
| **i18n** | English only | `next-intl` for EN/AR, RTL support |
| **Images** | `hostname: "**"` (open) | Whitelisted hosts (review §1.6) |

**Scaling watch-outs in the current code:**
- The admin and leads pages `getDocs` whole collections into the browser and filter client-side. Fine at hundreds of rows; it will get slow and expensive (Firestore reads are billed) at thousands. Move to server-side pagination/queries as the community grows.
- The chatbot re-reads all jobs every 2 minutes per instance — fine now, but cache centrally (Redis) once traffic grows.

---

## 4. Compliance & trust checklist (UAE)

Treat these as launch-blockers for the "scale up" push, not nice-to-haves:
- [ ] Real privacy policy describing exactly what's collected and why (PDPL lawful basis).
- [ ] Data retention policy (e.g. purge inactive talent PII after N months) + user-initiated deletion.
- [ ] Consent at signup for processing photos/measurements/visa data.
- [ ] No facilitation of work that violates visa conditions; a visible note encouraging legal work authorisation.
- [ ] Accurate marketing claims only (stats, "verified", client logos — get permission for logos).
- [ ] Secure handling of uploaded IDs/CVs (access-controlled storage, not public URLs guessable by anyone).
- [ ] Cookie/analytics consent banner if you target EU visitors.

---

## 5. SEO, social & growth (phase this AFTER the product/security work)

You said this comes later — correct call. But seed the foundations now so they compound:

**SEO (you already have a head start in `layout.tsx`):**
- Build **programmatic landing pages** per role × city: "Hire Hostesses in Dubai", "Event Promoters Abu Dhabi", "Brand Ambassadors UAE". This is where event-staffing search demand lives.
- Add a `sitemap.xml` + `robots.txt` (Next can generate these), per-page metadata (not just the root), and `JobPosting` structured data on each `/jobs/[id]` page (gets you into Google Jobs).
- Start a **blog/guides** section: "How to become an event hostess in Dubai", "What to wear for an exhibition gig", "Hiring event staff for GITEX" — captures both sides' search intent.

**Social / community (your existing community is the asset):**
- Instagram + TikTok are where UAE event talent lives. Short reels of events you staffed, talent spotlights, "day in the life of a brand ambassador".
- Your WhatsApp community → formalise it: job-drop broadcasts, referral incentives (talent refer talent).
- LinkedIn for the *client* side (event agencies, marketing managers, exhibition organisers).

**Engagement / retention:**
- Referral program (both sides).
- "Gig of the week" highlights.
- Reliability leaderboard / badges for top talent.

**Measurement:** define your funnel metrics now — talent signups, profile completion rate, applications/job, fill rate, time-to-fill, repeat clients — and watch them in one dashboard. Growth without these is guessing.

---

## 6. Suggested 90-day sequence (one view)

| Weeks | Theme | Outcome |
|-------|-------|---------|
| 1 | **Security Phase 0** (review doc) | Database locked down, no PII leak, real super-admin |
| 2–4 | Security Phase 1 + compliance basics | Strict rules, chat secured, privacy/terms/deletion live |
| 4–7 | Talent experience (Phase B) | Status tracking, WhatsApp notifications, job matching |
| 7–10 | Consistency cleanup + verified badges | One taxonomy, typed data, vetting visible |
| 10–14 | Client flow + monetisation test (Phase C) | Structured staffing requests, first revenue mechanic |
| 14–18 | Polish, analytics, programmatic SEO pages | Funnel instrumented, organic acquisition begins |

---

### TL;DR
1. **Your database is probably open right now — verify and fix that first** (PROJECT_REVIEW_2026.md §1.1–1.3). Nothing else matters until member PII is safe.
2. The stack is modern and the product instincts are good; the gap is a **consistent security model** and **two clearly separated experiences** (talent vs client).
3. Build trust (vetting, payments, compliance) as the moat, lean on **WhatsApp + Instagram + programmatic SEO** for UAE growth — but only after the foundation is solid.
