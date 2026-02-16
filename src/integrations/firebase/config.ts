import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdvhnjf4l0iuzu7cuDR-KTYeza2VOgI_U",
  authDomain: "labgearbooker.firebaseapp.com",
  projectId: "labgearbooker",
  storageBucket: "labgearbooker.firebasestorage.app",
  messagingSenderId: "609658134487",
  appId: "1:609658134487:web:62351a91314eca52403592",
  measurementId: "G-S5FTN7JRPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set session persistence for security - sessions are cleared when browser closes
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error('Error setting Firebase persistence:', error);
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
