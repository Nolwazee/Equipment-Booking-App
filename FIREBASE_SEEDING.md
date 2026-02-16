# Firebase Admin Seeding Guide

## Admin Credentials
- **Email:** `admin@labbook.com`
- **Password:** `Admin@123456`

## How to Seed Admin User to Firebase

### Option 1: Browser Console (Easiest)

1. **Start your app** (development mode):
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to `http://localhost:5173`

3. **Open the Browser Console** (Press `F12` or `Cmd+Option+J`)

4. **Run this command:**
   ```javascript
   await seedAdminToFirebase()
   ```

5. **You should see success messages:**
   ```
   ✅ Admin user created in Firebase Auth
   ✅ Admin profile created in Firestore
   ✅ Admin role set in Firestore
   ```

### Option 2: Using Node.js Script

Create a file called `seed-admin.js` in your project root:

```javascript
import { seedAdminToFirebase } from './src/lib/firebase-seeding.ts';

seedAdminToFirebase().then(result => {
  console.log(result);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
```

Then run:
```bash
node seed-admin.js
```

### Option 3: Firebase Admin SDK (Production)

For production environments, use the Firebase Admin SDK:

```bash
npm install firebase-admin
```

Create a file `seed-admin-server.js`:

```javascript
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedAdmin() {
  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: 'admin@labbook.com',
      password: 'Admin@123456'
    });

    // Create profile in Firestore
    await db.collection('profiles').doc(userRecord.uid).set({
      user_id: userRecord.uid,
      email: 'admin@labbook.com',
      full_name: 'Lab Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Set admin role
    await db.collection('user_roles').doc(userRecord.uid).set({
      user_id: userRecord.uid,
      role: 'admin'
    });

    console.log('✅ Admin seeded successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedAdmin();
```

## What Gets Created

The seeding process creates:

1. **Firebase Authentication User**
   - Email: `admin@labbook.com`
   - Password: `Admin@123456`

2. **Firestore `profiles` Collection**
   - Document ID: `user_id`
   - Contains: email, full_name, timestamps

3. **Firestore `user_roles` Collection**
   - Document ID: `user_id`
   - Contains: role = "admin"

## Verify Seeding

Check Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `labgearbooker` project
3. **Authentication** → Check if `admin@labbook.com` exists
4. **Firestore Database** → Check `profiles` and `user_roles` collections

## Login

Once seeded, log in with:
- **Email:** `admin@labbook.com`
- **Password:** `Admin@123456`

You'll be automatically redirected to the Admin Dashboard.

## Troubleshooting

**Error: "auth/email-already-in-use"**
- Admin user already exists, no action needed

**Error: "FirebaseError: Failed to get document..."**
- Firestore database might not be initialized
- Go to Firebase Console and create Firestore database in **Test Mode**

**Error: "The user does not have permission..."**
- Update Firestore security rules (should be in Test Mode)
