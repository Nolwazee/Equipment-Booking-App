/**
 * Development/Testing Credentials
 * These are demo credentials for testing the application.
 * In production, use a proper identity management system.
 */

import { auth, db } from '@/integrations/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@labbook.com',
    password: 'Admin@123456',
  },
};

/**
 * Seeds admin user to Firebase Authentication and Firestore
 * Run this once during Firebase setup
 */
export async function seedAdminUser() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      DEMO_CREDENTIALS.admin.email,
      DEMO_CREDENTIALS.admin.password
    );

    const userId = userCredential.user.uid;

    // Create admin profile
    await setDoc(doc(db, 'profiles', userId), {
      user_id: userId,
      email: DEMO_CREDENTIALS.admin.email,
      full_name: 'Lab Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Set admin role
    await setDoc(doc(db, 'user_roles', userId), {
      user_id: userId,
      role: 'admin',
    });

    console.log('✅ Admin user seeded successfully');
    return { success: true, userId };
  } catch (error: any) {
    // User may already exist
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists');
      return { success: true, message: 'Admin already exists' };
    }
    console.error('❌ Error seeding admin user:', error.message);
    return { success: false, error: error.message };
  }
}
