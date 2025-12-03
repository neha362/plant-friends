// other imports
import { getAuth } from 'firebase/auth';
import { signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// other Firebase setup stuff
import * as dotenv from 'dotenv'

dotenv.config();

const apiKey: string | undefined = process.env.MY_API_KEY;

if (!apiKey) {
  throw new Error('MY_API_KEY is not defined in environment variables');
}

const firebaseConfig = {
  apiKey: process.env.MY_API_KEY,
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const providers = {
  googleProvider: new GoogleAuthProvider(),
};



const signInWithGoogle = () => {
  signInWithPopup(auth, providers.googleProvider);
};

const signOutFirebase = () => {
  signOut(auth);
};

export {
  db,
  auth,
  signInWithGoogle,
  signOutFirebase as signOut,
};