# Security Fixes — Deploy Runbook

This is the **exact order** to roll out the security changes safely on the live site.
Doing the Firestore rules without step 2 first **will lock your admins out**, so follow the sequence.

> Context: the new `firestore.rules` look up admins by `admins/{email}`. Your existing
> admin docs use random IDs, so they must be re-keyed by email first (step 2). The
> migration uses your service account, which bypasses rules, so it can't lock you out.

---

## What changed in code (already done)

| File | Change |
|------|--------|
| `firestore.rules` | Correct `isAdmin()` (email-keyed `exists()`), `users` locked to owner-or-admin, super-admin via role (no hardcoded email), write validation, immutable activity logs. |
| `scripts/migrate-admins.js` | One-time migration: re-key admin docs by email + guarantee your super-admin. |
| `app/admin/page.tsx` | Removed hardcoded `test1@gmail.com`; admins now stored as `admins/{email}`; super-admin derived from `role`. |
| `contexts/AuthContext.tsx` | No longer reads the whole `admins` collection on every login (1 cheap doc read instead); removed duplicate profile reads and email console logging. |
| `next.config.ts` | Image hosts restricted to ones we use; security headers added. |
| `app/api/chat/route.ts` | Validates message shape; caps per-message (2k) and total (12k) characters. |
| `lib/validation.ts` | Name validation now accepts Arabic/accented (Unicode) names. |
| `lib/constants.ts` | New canonical categories / emirates / payment enums (source of truth). |
| `.env.example` | Complete + documented (added the missing `OPENAI_API_KEY`). |

---

## Step 0 — Prerequisites
- Make sure `.env.local` has real values for `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (service account).
- Decide your real super-admin email (use **your own**, with 2FA on the Google account).
- Node 20+ (`node -v`).

## Step 1 — Back up
In Firebase Console, or via the Admin panel "Export DB" button, take a full export first.

## Step 2 — Migrate admin docs to email keys
```bash
node --env-file=.env.local scripts/migrate-admins.js you@yourdomain.com
```
The email argument is forced to `super_admin`, guaranteeing you keep access.
The script is idempotent — safe to re-run. Confirm the output lists your admins.

## Step 3 — Verify in Firebase Console
Firestore → `admins` collection. Each document ID should now be a **lowercase email**
(not a random string), each with a `role` of `admin` or `super_admin`.

## Step 4 — Deploy the security rules
If you use the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
Or paste `firestore.rules` into Firebase Console → Firestore → Rules → Publish.

## Step 5 — Smoke test (do this right after deploying rules)
- [ ] Log in as your super-admin → `/admin` loads, jobs/applications/users visible.
- [ ] Log in as a normal (non-admin) user → can view jobs, build profile, apply.
- [ ] As a normal user, open DevTools console and try to read another user:
      `firebase.firestore().collection('users').get()` should be **denied**.
- [ ] Post / edit / delete a job as admin → works.
- [ ] Submit a job application as a normal user → works and shows in `/dashboard`.
- [ ] Add a second admin from the Admin panel → creates `admins/{that-email}`.

## Step 6 — Deploy the app
Push the code and let Vercel build, **after** confirming `OPENAI_API_KEY` and all
other env vars are set in Vercel → Settings → Environment Variables.

---

## Rollback
- **Rules:** Firebase Console → Firestore → Rules keeps version history; click an older
  version → Publish to revert instantly.
- **Code:** `git revert` the commit; Vercel redeploys the previous build.
- The migration only **re-keys** admin docs (no data loss); if needed you can recreate
  admins from your Step 1 backup.

---

## Still recommended (not yet done — tracked for the next pass)
- **Upstash Redis** for real rate limiting (the in-memory limiter resets per serverless
  instance, so it barely limits on Vercel). Env vars are stubbed in `.env.example`.
- **Custom claims** for admin role (removes even the one admin doc read; the cleanest model).
- Wire `lib/constants.ts` into the job form / filters / chatbot during the redesign so the
  category taxonomy is consistent end-to-end.
- Enforce verified email before applying, if desired.
