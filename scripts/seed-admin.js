#!/usr/bin/env node

/**
 * Firebase Admin Seeding Script
 * Run this with: node scripts/seed-admin.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdvhnjf4l0iuzu7cuDR-KTYeza2VOgI_U",
  authDomain: "labgearbooker.firebaseapp.com",
  projectId: "labgearbooker",
  storageBucket: "labgearbooker.firebasestorage.app",
  messagingSenderId: "609658134487",
  appId: "1:609658134487:web:62351a91314eca52403592",
  measurementId: "G-S5FTN7JRPR"
};

const ADMIN_EMAIL = 'admin@labbook.com';
const ADMIN_PASSWORD = 'Admin@123456';

async function seedAdmin() {
  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('➡️  Attempting to create admin user...');
    
    let userId;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
      );
      userId = userCredential.user.uid;
      console.log(`✅ Admin user created in Firebase Auth: ${userId}`);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Admin user already exists in Firebase Auth');
        // Get the user ID by attempting a different approach
        // For now, we'll ask the user to provide it or try login
        console.log('⚠️  Please log in with the admin account to verify it exists');
        process.exit(1);
      } else {
        throw authError;
      }
    }

    console.log('➡️  Creating admin profile in Firestore...');
    await setDoc(doc(db, 'profiles', userId), {
      user_id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Lab Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log('✅ Admin profile created');

    console.log('➡️  Setting admin role in Firestore...');
    await setDoc(doc(db, 'user_roles', userId), {
      user_id: userId,
      role: 'admin',
    });
    console.log('✅ Admin role set');

    // Verify collections
    console.log('\n📊 Verifying Firestore collections...');
    const collectionsToCheck = ['profiles', 'user_roles', 'equipment', 'bookings'];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`   ${collectionName}: ${snapshot.size} documents`);
      } catch (err) {
        console.warn(`   ⚠️  ${collectionName}: Not accessible (may need to be created)`);
      }
    }

    console.log('\n✅ Firebase seeding completed successfully!\n');
    console.log('📝 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 Login at your application to test;\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:');
    console.error(error.message);
    
    if (error.code === 'permission-denied') {
      console.error('\n💡 Firestore Security Rules might be blocking writes.');
      console.error('   Make sure your Firestore is in Test Mode or has proper rules.');
    }
    
    process.exit(1);
  }
}

seedAdmin();
