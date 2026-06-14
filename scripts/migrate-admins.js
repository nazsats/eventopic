/**
 * One-time migration: convert admin documents to be keyed by email,
 * so the new firestore.rules `isAdmin()` (which does exists(admins/{email}))
 * works correctly.
 *
 * Old shape:  admins/<randomId>  { email, role, ... }
 * New shape:  admins/<email>     { email, role, ... }
 *
 * This runs with the Firebase Admin SDK (service account), which BYPASSES
 * security rules, so it can seed the first super-admin safely.
 *
 * USAGE (Node 20+):
 *   node --env-file=.env.local scripts/migrate-admins.js you@yourdomain.com
 *
 * The optional email argument is forced to role "super_admin" so you are
 * guaranteed not to lock yourself out. Re-running is safe (idempotent).
 */
const admin = require('firebase-admin');

const SUPER_ADMIN_EMAIL = (process.argv[2] || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')[0]
  .trim()
  .toLowerCase();

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!process.env.FIREBASE_CLIENT_EMAIL || !privateKey || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('Missing FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY / NEXT_PUBLIC_FIREBASE_PROJECT_ID. ' +
    'Run with: node --env-file=.env.local scripts/migrate-admins.js you@domain.com');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = admin.firestore();

async function main() {
  const snap = await db.collection('admins').get();
  console.log(`Found ${snap.size} existing admin document(s).`);

  let migrated = 0;
  const batch = db.batch();

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const email = (data.email || '').trim().toLowerCase();
    if (!email) {
      console.warn(`  - Skipping doc ${docSnap.id}: no email field.`);
      continue;
    }
    // Already keyed by email? leave it.
    if (docSnap.id === email) continue;

    // Re-create keyed by email, preserving role/metadata.
    batch.set(
      db.collection('admins').doc(email),
      { ...data, email, role: data.role || 'admin' },
      { merge: true }
    );
    // Remove the old random-id doc.
    batch.delete(docSnap.ref);
    migrated++;
    console.log(`  - Migrating ${docSnap.id} -> ${email} (${data.role || 'admin'})`);
  }

  if (SUPER_ADMIN_EMAIL) {
    batch.set(
      db.collection('admins').doc(SUPER_ADMIN_EMAIL),
      {
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        addedAt: new Date().toISOString(),
        addedBy: 'migration',
      },
      { merge: true }
    );
    console.log(`  - Ensuring super_admin: ${SUPER_ADMIN_EMAIL}`);
  }

  await batch.commit();
  console.log(`Done. Migrated ${migrated} doc(s). You can now deploy firestore.rules.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
