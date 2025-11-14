import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNJXVVNcADUHQKHxjoOB7lU6PoQTWUcoc",
  authDomain: "plant-friends-ddba1.firebaseapp.com",
  projectId: "plant-friends-ddba1",
  storageBucket: "plant-friends-ddba1.firebasestorage.app",
  messagingSenderId: "491056599576",
  appId: "1:491056599576:web:1433d4a1279d032fede96d",
  measurementId: "G-78RBXSLXZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
