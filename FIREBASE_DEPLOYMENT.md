# Firebase Security Rules Deployment Guide

## Overview

The `firestore.rules` file contains comprehensive security rules to protect your Firestore database. These rules **must be deployed** to Firebase Console for them to take effect.

## ⚠️ Important Notes

> [!WARNING]
> **Breaking Change Alert**
> 
> Deploying these security rules will **restrict database access**. Make sure:
> - All API routes are updated to use authentication (✅ Already done)
> - Users are properly authenticated before accessing data
> - Test in development before deploying to production

## Deployment Steps

### Option 1: Firebase Console (Recommended for First Time)

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `eventopic`

2. **Navigate to Firestore Rules**
   - Click on **Firestore Database** in the left sidebar
   - Click on the **Rules** tab

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in your project
   - Copy the entire contents
   - Paste into the Firebase Console editor

4. **Publish Rules**
   - Click the **Publish** button
   - Wait for confirmation

### Option 2: Firebase CLI (For Automated Deployment)

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init firestore
   ```
   - Select your project
   - Accept `firestore.rules` as the rules file

4. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Security Rules Summary

The deployed rules will enforce:

### ✅ User Data Protection
- Users can only read/write their own profile
- Authentication required for all user operations

### ✅ Admin Collection Security
- Only verified admins can read admin list
- Only super admin can modify admin list

### ✅ Jobs Collection
- **Public read** - Anyone can view job listings
- **Admin write** - Only admins can create/edit/delete jobs
- Job owners can edit their own jobs

### ✅ Applications Collection
- Users can create applications
- Users can only read their own applications
- Admins can read and update all applications

### ✅ Leads & Inquiries
- Authenticated users can submit
- Only admins can view and manage

### ✅ Default Deny
- All unlisted collections are denied by default

## Testing After Deployment

### 1. Test Unauthenticated Access (Should Fail)
```javascript
// This should fail with permission denied
const jobs = await getDocs(collection(db, "users"));
```

### 2. Test Authenticated User Access (Should Succeed)
```javascript
// User should be able to read their own profile
const userDoc = await getDoc(doc(db, "users", currentUser.uid));
```

### 3. Test Cross-User Access (Should Fail)
```javascript
// User should NOT be able to read another user's profile
const otherUserDoc = await getDoc(doc(db, "users", "other-user-id"));
```

### 4. Test Admin Operations
- Login as admin
- Try creating a job (should succeed)
- Try viewing applications (should succeed)

## Rollback Plan

If something goes wrong, you can quickly rollback:

1. Go to Firebase Console → Firestore → Rules
2. Click on the **History** tab
3. Select a previous version
4. Click **Restore**

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
# Firebase Admin SDK (for server-side verification)
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Admin emails
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Getting Firebase Admin Credentials

1. Go to Firebase Console → Project Settings
2. Click on **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file
5. Copy the values to your `.env.local`:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause:** Security rules are blocking the operation

**Solution:**
1. Check if user is authenticated
2. Verify the user has permission for that operation
3. Check Firebase Console → Firestore → Rules → Simulator to test

### Error: "Admin operations failing"

**Cause:** Admin email not in the admins collection

**Solution:**
1. Add your email to the `admins` collection in Firestore
2. Or update `NEXT_PUBLIC_ADMIN_EMAILS` environment variable

## Next Steps

After deploying security rules:

1. ✅ Test all user flows
2. ✅ Test admin operations
3. ✅ Monitor Firebase Console for errors
4. ✅ Set up Firebase monitoring alerts

## Support

If you encounter issues:
- Check Firebase Console → Firestore → Rules → Simulator
- Review the rules in `firestore.rules`
- Check browser console for detailed error messages
