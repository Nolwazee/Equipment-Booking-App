#!/usr/bin/env node

/**
 * Firebase Admin Setup Verification & Completion
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

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

async function verifyAndComplete() {
  try {
    console.log('🚀 Initializing Firebase Verification...\n');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🔐 Logging in as admin to get user ID...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );
    const userId = userCredential.user.uid;
    console.log(`✅ Logged in successfully: ${userId}\n`);

    // Check and create profile if missing
    console.log('📋 Checking admin profile...');
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      console.log('✅ Admin profile exists');
    } else {
      console.log('❌ Admin profile missing, creating...');
      await setDoc(profileRef, {
        user_id: userId,
        email: ADMIN_EMAIL,
        full_name: 'Lab Administrator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log('✅ Admin profile created');
    }

    // Check and create role if missing
    console.log('\n📋 Checking admin role...');
    const roleRef = doc(db, 'user_roles', userId);
    const roleSnap = await getDoc(roleRef);
    
    if (roleSnap.exists()) {
      console.log('✅ Admin role exists');
    } else {
      console.log('❌ Admin role missing, creating...');
      await setDoc(roleRef, {
        user_id: userId,
        role: 'admin',
      });
      console.log('✅ Admin role created');
    }

    // Verify all collections
    console.log('\n📊 Firestore Collections Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const collectionsToCheck = ['profiles', 'user_roles', 'equipment', 'bookings'];
    for (const collectionName of collectionsToCheck) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`✅ ${collectionName.padEnd(12)} : ${snapshot.size} documents`);
      } catch (err) {
        console.log(`❌ ${collectionName.padEnd(12)} : Not accessible`);
      }
    }

    console.log('\n✅ Firebase setup verification complete!\n');
    console.log('📝 Admin Account Ready:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`User ID:  ${userId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🚀 You can now log in to the admin dashboard!\n');

  } catch (error) {
    console.error('\n❌ Error during verification:');
    console.error(error.message);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.error('\n💡 Admin login failed. The credentials might be incorrect.');
      console.error(`   Email: ${ADMIN_EMAIL}`);
      console.error(`   Password: ${ADMIN_PASSWORD}`);
    }
    
    if (error.code === 'permission-denied') {
      console.error('\n💡 Firestore permission denied.');
      console.error('   Make sure your Firestore is in Test Mode.');
      console.error('   Go to Firebase Console > Firestore > Rules and use Test Mode.');
    }
    
    process.exit(1);
  }
}

verifyAndComplete();
