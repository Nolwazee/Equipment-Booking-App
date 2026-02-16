/**
 * Firebase Seeding Setup
 * Run this script once to initialize your Firebase database with demo data
 */

import { auth, db } from '@/integrations/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { DEMO_CREDENTIALS } from './credentials';

export async function seedAdminToFirebase() {
  console.log('🚀 Starting Firebase admin seeding...');
  
  try {
    // Create admin user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      DEMO_CREDENTIALS.admin.email,
      DEMO_CREDENTIALS.admin.password
    );

    const userId = userCredential.user.uid;
    console.log(`✅ Admin user created in Firebase Auth: ${userId}`);

    // Create admin profile in Firestore
    await setDoc(doc(db, 'profiles', userId), {
      user_id: userId,
      email: DEMO_CREDENTIALS.admin.email,
      full_name: 'Lab Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log('✅ Admin profile created in Firestore');

    // Set admin role in Firestore
    await setDoc(doc(db, 'user_roles', userId), {
      user_id: userId,
      role: 'admin',
    });
    console.log('✅ Admin role set in Firestore');

    // Verify the seeding was successful
    const collections = ['profiles', 'user_roles', 'equipment', 'bookings'];
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`📊 ${collectionName}: ${snapshot.size} documents`);
      } catch (err) {
        console.warn(`⚠️ Could not access ${collectionName} collection:`, err);
      }
    }

    console.log('✅ Firebase seeding completed successfully!');
    console.log(`
    📝 Admin Credentials:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Email:    ${DEMO_CREDENTIALS.admin.email}
    Password: ${DEMO_CREDENTIALS.admin.password}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    return { 
      success: true, 
      userId,
      email: DEMO_CREDENTIALS.admin.email,
      message: 'Admin user seeded successfully to Firebase!'
    };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists in Firebase');
      return { 
        success: true, 
        message: 'Admin user already exists. No action needed.',
        email: DEMO_CREDENTIALS.admin.email
      };
    }
    console.error('❌ Error seeding admin user:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Make the function globally available for browser console access
if (typeof window !== 'undefined') {
  (window as any).seedAdminToFirebase = seedAdminToFirebase;
}
