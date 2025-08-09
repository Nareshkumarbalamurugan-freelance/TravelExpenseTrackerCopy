// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1_Ziv0_5TCyDWU-2yE8VGVc7aHVZ-_3U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "expensetracker-c25fd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "expensetracker-c25fd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "expensetracker-c25fd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847120647017",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847120647017:web:c4c0a8e591551acf20f3f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
