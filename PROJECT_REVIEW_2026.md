# Eventopic — Project Review & Security Audit

**Date:** 14 June 2026
**Reviewed by:** Engineering review (Claude)
**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Firebase (Firestore + Auth) · Cloudinary · OpenAI · Tailwind v4 · Vercel
**Status:** Live in production, active community.

---

## 0. How to read this document

Findings are tagged by severity:

| Tag | Meaning | Act within |
|-----|---------|-----------|
| 🔴 **CRITICAL** | Data exposure / account takeover risk. A live site with real users is exposed *right now*. | 24–72 hours |
| 🟠 **HIGH** | Serious weakness, exploitable with low effort. | 1–2 weeks |
| 🟡 **MEDIUM** | Real issue but limited blast radius. | This quarter |
| 🔵 **LOW** | Cleanliness / consistency / maintainability. | When convenient |

**The single most important takeaway:** there is strong evidence your **Firestore database is currently running in an effectively-open state** (rules not enforced as written). Every signed-in user can likely read the entire `users` collection — names, phone numbers, dates of birth, visa/passport expiry, body measurements, and health notes of your whole community. Treat Section 1.1 and 1.2 as a "drop everything" item.

---

## 1. Security vulnerabilities

### 1.1 🔴 The Firestore admin rule is broken — your security rules probably aren't doing what you think

[firestore.rules:11-14](firestore.rules#L11-L14):

```
function isAdmin() {
  return isAuthenticated() &&
    get(/databases/$(database)/documents/admins/$(request.auth.token.email)).data.email == request.auth.token.email;
}
```

This looks up an admin document **by document ID = the user's email** (`admins/{email}`). But everywhere in the app, admin docs are created with `addDoc(...)`, which generates **random document IDs**, not email-keyed ones — see [app/admin/page.tsx:162](app/admin/page.tsx#L162) and [:282](app/admin/page.tsx#L282). So `get(admins/{email})` always points at a **non-existent document**, `.data` is null, and the rule throws → evaluates to **deny**.

Consequences if these rules were truly deployed and enforced:
- No admin could ever create/edit/delete a job, lead, or application.
- The admin panel reads `getDocs(collection(db, "admins"))` on **every login** for **every user** ([contexts/AuthContext.tsx:90](contexts/AuthContext.tsx#L90)) — that read requires `isAdmin()`, which is broken, so it would fail for everyone.

Yet the app works in production. The only way that's possible is that **the rules in this file are not the rules actually live on your project** (e.g. the database is still in test mode: `allow read, write: if request.time < ...`, or an `allow all` rule was deployed to "make it work").

**Action:**
1. Go to Firebase Console → Firestore → Rules and look at what is *actually deployed today*. If it's open/test mode, that is a live data breach risk.
2. Rewrite `isAdmin()` to match how admins are stored. Two clean options:
   - **Best:** stop storing admin status in a collection and use **Firebase custom claims** (`request.auth.token.admin == true`), set via the Admin SDK. Then rules become `function isAdmin() { return request.auth.token.admin == true; }` — fast, no extra read.
   - **Quick fix:** key the admin docs by email so the path matches: write to `setDoc(doc(db, "admins", email), {...})` instead of `addDoc`, and the existing rule works.

### 1.2 🔴 Every authenticated user can read every user's full PII

[firestore.rules:22-23](firestore.rules#L22-L23):

```
match /users/{userId} {
  allow read: if isAuthenticated();   // ← ANY logged-in user, not just the owner
```

The `users` documents contain (from [app/profile/page.tsx:173-243](app/profile/page.tsx#L173-L243)): full name, phone, WhatsApp, nationality, DOB, gender, **visa type & expiry, passport expiry**, education, **body measurements (height/weight/bust/waist/hips)**, eye/hair/skin colour, health issues, and photo URLs.

Any user who signs up can open DevTools and run a single Firestore query to **dump the entire member database**. For a UAE-based staffing business handling models' and hostesses' personal data, this is both a serious privacy breach and very likely a **UAE PDPL** (and GDPR, for any EU applicants) violation.

**Action:** restrict to owner-or-admin:
```
match /users/{userId} {
  allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  allow write, create: if isAuthenticated() && request.auth.uid == userId;
}
```
For the public-facing talent directory you'll build later (see roadmap), expose only a *curated, non-sensitive* subset through a separate collection or a server endpoint — never the raw `users` docs.

### 1.3 🔴 Hardcoded super-admin email (`test1@gmail.com`)

The super-admin is hardcoded as a throwaway test address in **two** places:
- [firestore.rules:18](firestore.rules#L18): `request.auth.token.email == 'test1@gmail.com'`
- [app/admin/page.tsx:114](app/admin/page.tsx#L114): `const SUPER_ADMIN_EMAIL = "test1@gmail.com";`

Meanwhile the bootstrap fallback uses a *different* email, `ansarinazrul91@gmail.com` ([app/admin/page.tsx:160](app/admin/page.tsx#L160)), and `.env.example` suggested yet others. Whoever controls `test1@gmail.com` is your super-admin. If that address is unregistered or recoverable, it's a takeover path.

**Action:** remove the hardcoded constant entirely. Drive super-admin from a custom claim (preferred) or a single source of truth in env, and make sure the email belongs to *you* and has MFA enabled.

### 1.4 🟠 The "secured" API routes are bypassed by the real flows

You built proper hardened endpoints — [app/api/submit-staff/route.ts](app/api/submit-staff/route.ts) and [submit-client/route.ts](app/api/submit-client/route.ts) — with auth + validation + rate limiting + field whitelisting. **Good work.** But the actual write paths in the app don't use them:

- Job applications write **directly** to Firestore from the browser with no server validation: [app/jobs/[jobId]/page.tsx:169](app/jobs/[jobId]/page.tsx#L169) (`addDoc(collection(db, "applications"), { ...form })`). The whole `form` object is spread in unsanitized.
- Profile saves write directly client-side: [app/profile/page.tsx:423](app/profile/page.tsx#L423).
- Lead CSV uploads write directly client-side in a batch: [app/admin/leads/page.tsx:338-349](app/admin/leads/page.tsx#L338-L349).

So your validation library protects two endpoints that the UI may not even call, while the endpoints that *do* run go straight to the database governed only by Firestore rules (which, per 1.1, are themselves suspect). This is the core **inconsistency** in the codebase: two different security models, and the weaker one is the one in use.

**Action:** pick one model and apply it everywhere. For a Firebase app the pragmatic choice is **"Firestore rules are the firewall"**: make the rules correct and strict (validate field types/shapes in rules with `request.resource.data`), and treat client writes as the norm. Reserve API routes for things that genuinely need server secrets (OpenAI, email, payments). Whichever you choose, every write path must be covered by it.

### 1.5 🟠 The AI chat endpoint is unauthenticated and cost-exposed

[app/api/chat/route.ts](app/api/chat/route.ts) has no auth. Its only protection is an in-memory IP rate limiter ([:23-37](app/api/chat/route.ts#L23-L37)) keyed off `x-forwarded-for`, which:
- **Resets on every serverless cold start** (the `Map` is per-instance), so on Vercel it barely limits anything.
- Trusts a **client-spoofable** header — an attacker sets a random `x-forwarded-for` per request and is never limited.

Anyone can script your `/api/chat` endpoint and burn your OpenAI budget, and feed arbitrary message history (prompt-injection) that gets sent to the model.

**Action:** require a Firebase ID token (reuse `requireAuth`) or at minimum a server-side, Redis-backed rate limit (Upstash) keyed off the *Vercel-trusted* IP. Cap `messages` length and total characters. Consider a hard daily spend cap in the OpenAI dashboard.

### 1.6 🟡 `next.config.ts` allows images from any host

[next.config.ts:7-12](next.config.ts#L7-L12) sets `remotePatterns: [{ protocol: "https", hostname: "**" }]`. This turns your Next image optimizer into an **open proxy** — anyone can route arbitrary remote images through your server (bandwidth/cost abuse, and a mild SSRF surface).

**Action:** whitelist only the hosts you use: `res.cloudinary.com`, `lh3.googleusercontent.com` (Google avatars), `firebasestorage.googleapis.com`, plus the lead-image hosts you actually display. Note that one lead image uses a raw `<img>` ([app/admin/leads/page.tsx:729](app/admin/leads/page.tsx#L729)) so it isn't proxied — that's fine for now but inconsistent with `next/image` elsewhere.

### 1.7 🟡 No security headers / CSP

There are no security headers configured. Add a `headers()` block (or middleware) to `next.config.ts` setting at least: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `frame-ancestors` via CSP to prevent clickjacking of the auth/admin pages), and `Referrer-Policy: strict-origin-when-cross-origin`. A real Content-Security-Policy is more work with inline GA scripts but worth it before scaling.

### 1.8 🟡 Client-side admin gate is cosmetic

`/admin` and `/admin/leads` decide access in React after fetching the admins list ([app/admin/page.tsx:178](app/admin/page.tsx#L178), [app/admin/leads/page.tsx:246](app/admin/leads/page.tsx#L246)). That only hides the UI — the real protection is Firestore rules. Once 1.1/1.2 are fixed this is fine, but **never rely on the client check alone**. The DB-level rules are what actually stop a crafted request.

### 1.9 🟡 Firebase Admin SDK init failures are swallowed

[lib/auth.ts:18-20](lib/auth.ts#L18-L20) catches a failed Admin init and only `console.warn`s. If credentials are missing in production, every `requireAuth` call then throws a generic 401/500 and you'd be debugging blind. Fail loudly at boot, or log clearly that admin verification is disabled.

### 1.10 🔵 Docs claim DOMPurify; code uses a regex

[SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) says XSS is handled "with DOMPurify", but [lib/validation.ts:48](lib/validation.ts#L48) actually strips tags with a regex (`isomorphic-dompurify` is installed but unused). The regex is okay for stripping, but since you render user text in places like the profile "About me" and applications, either use the installed DOMPurify or update the docs so they don't overstate the protection. (React already escapes by default, so stored XSS risk is low unless you ever use `dangerouslySetInnerHTML`.)

---

## 2. Code quality & consistency issues

### 2.1 🟡 Two rate limiters, two philosophies
There's a shared `lib/rateLimit.ts` *and* a second hand-rolled limiter inside `app/api/chat/route.ts`. Consolidate on one (Redis-backed) implementation.

### 2.2 🟡 Category taxonomy is inconsistent across the app
The job categories don't agree with each other:
- Chatbot context groups by `staffing | models_entertainment | promotions | other` ([app/api/chat/route.ts:91-96](app/api/chat/route.ts#L91-L96)).
- Admin job filter offers `staffing | models | promotions | other` ([app/admin/page.tsx:805-808](app/admin/page.tsx#L805-L808)) — note `models` vs `models_entertainment`.
- The job creation form stores the *job-title string* (e.g. "Hostess", "DJ", "Software Developer") in the same `category` field ([app/admin/page.tsx:516-607](app/admin/page.tsx#L516-L607)).
- The profile wizard uses a third taxonomy entirely (`event_staff`, `hospitality`, `retail_staff`, …).

So filtering by category is unreliable and the chatbot's grouping rarely matches real data. **Action:** define one canonical category enum in a shared `lib/constants.ts`, separate "category" (the group) from "role/title" (the specific job), and reuse it in the form, filters, chatbot, and profile.

### 2.3 🟡 Name validation rejects real UAE-market names
[lib/validation.ts:68](lib/validation.ts#L68) uses `/^[a-zA-Z\s'-]+$/`, which rejects accented Latin names (José, François) and all Arabic script. For a UAE audience this will block legitimate applicants. Allow Unicode letters: `/^[\p{L}\p{M}\s'-]+$/u`.

### 2.4 🔵 `any` types throughout
`validateStaffInquiry(data: any)`, `authenticatedPost<T>(url, data: any)`, many `as any` casts in the admin/profile pages. Define real input interfaces; it'll catch shape bugs like 2.2 at compile time.

### 2.5 🔵 Duplicate / dead components
There are two job cards — [components/Jobcard.tsx](components/Jobcard.tsx) and [components/cards/JobCard.tsx](components/cards/JobCard.tsx) — differing only in casing, which is a landmine on case-insensitive Windows vs case-sensitive Linux (Vercel). Confirm which is used and delete the other. Also `scripts/replace-toast.js` looks like a one-off migration script that can be removed.

### 2.6 🔵 Verbose `console.log` in auth hot path
[contexts/AuthContext.tsx](contexts/AuthContext.tsx) logs user emails and redirect decisions on every auth change (e.g. [:113](contexts/AuthContext.tsx#L113), [:116](contexts/AuthContext.tsx#L116)). Logging emails to the browser console is a minor PII leak and noisy. Strip or gate behind a debug flag.

### 2.7 🔵 `emailVerified` is computed but never enforced
`requireAuth` returns `emailVerified` and signup sends a verification email, but nothing requires a verified email before applying to jobs or submitting inquiries — so the verification step is decorative. Decide whether to enforce it.

### 2.8 🔵 The full DB export ships PII to the browser
"Export DB" ([app/admin/page.tsx:119-141](app/admin/page.tsx#L119-L141)) pulls every collection (users, leads, applications, …) into a client-side JSON download. Useful, but it's a large unencrypted PII export triggered by a client button. Fine for a solo super-admin; revisit once you have multiple admins (audit it, restrict to super-admin only, and you already log it — good).

---

## 3. What's done well (keep doing this)

- **Clean separation of `lib/` concerns** — auth, validation, rate limiting, and the Firebase client are each isolated and readable.
- **Field whitelisting** in the API routes ([submit-staff/route.ts:55-65](app/api/submit-staff/route.ts#L55-L65)) instead of spreading raw input — exactly right.
- **Thoughtful UX**: client-side image compression before Cloudinary upload, the two-phase CSV upload with a confirmation modal and duplicate detection, optimistic UI updates, activity logging for admin actions.
- **SEO foundations** already in `layout.tsx` (Open Graph, Twitter cards, JSON-LD Organization schema, canonical URLs).
- **Secrets hygiene**: `.env*` is correctly gitignored and no secrets are committed.
- **Role model** (super_admin vs admin, "can't remove last super admin", "can't remove yourself") shows good product thinking.

---

## 4. Environment variables you need (`.env.local`)

I've rewritten [.env.example](.env.example) with the complete list and inline notes. Summary:

| Key | Scope | Required? | Used by |
|-----|-------|-----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | public | ✅ | [lib/firebase.ts](lib/firebase.ts) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | public | ✅ | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | public | ✅ | firebase.ts, auth.ts |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | public | ✅ | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | public | ✅ | firebase.ts |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | public | ✅ | firebase.ts |
| `FIREBASE_CLIENT_EMAIL` | **secret** | ✅ | [lib/auth.ts](lib/auth.ts) (Admin SDK) |
| `FIREBASE_PRIVATE_KEY` | **secret** | ✅ | auth.ts (keep `\n`, wrap in quotes) |
| `OPENAI_API_KEY` | **secret** | ✅ | [api/chat/route.ts](app/api/chat/route.ts) — **was missing from the old template** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | public | ✅ | [profile/page.tsx](app/profile/page.tsx) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | public | ✅ | profile (must be an **unsigned** preset) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | public | ✅ | admin bootstrap, auth.ts |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | public | optional | [layout.tsx](app/layout.tsx) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | secret | recommended | production rate limiting (not wired yet) |

> Two things to action: (a) `OPENAI_API_KEY` must be added to your real `.env.local` and to Vercel's env settings or the chatbot is dead in production; (b) confirm all the above are set in **Vercel → Project → Settings → Environment Variables**, not just locally.

---

## 5. Prioritised remediation plan

**Phase 0 — Stop the bleed (this week)**
1. Inspect the *deployed* Firestore rules in Firebase Console. Assume open until proven otherwise. (§1.1)
2. Lock down `users` reads to owner-or-admin and deploy. (§1.2)
3. Fix `isAdmin()` so rules actually pass for real admins (move to custom claims, or key admin docs by email). (§1.1)
4. Replace the hardcoded `test1@gmail.com` super-admin with your own, MFA-protected. (§1.3)
5. Add `OPENAI_API_KEY` to Vercel; confirm all env vars are present in prod. (§4)

**Phase 1 — Harden (1–2 weeks)**
6. Write strict, type-validating Firestore rules for every collection and decide on one write model (client+rules vs API). (§1.4)
7. Auth + Upstash rate limit the chat endpoint; cap message size; set an OpenAI spend cap. (§1.5)
8. Restrict `next.config.ts` image hosts and add security headers. (§1.6, §1.7)

**Phase 2 — Consistency cleanup (this quarter)**
9. One canonical category taxonomy in `lib/constants.ts`. (§2.2)
10. Unicode-aware name validation. (§2.3)
11. Remove duplicate `Jobcard`/`JobCard`, dead scripts, and console PII logging. (§2.5, §2.6)
12. Replace `any` with real types on the data boundaries. (§2.4)

Sections 6+ (the growth/upscaling plan, Dubai market research, and the advanced feature roadmap) are in **[ROADMAP_2026.md](ROADMAP_2026.md)**.
