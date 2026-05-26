import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_IT6Nm8nj8B6sSHKYviJPQPuwwvrFELw",
  authDomain: "rayalrent.firebaseapp.com",
  projectId: "rayalrent",
  storageBucket: "rayalrent.firebasestorage.app",
  messagingSenderId: "901963085097",
  appId: "1:901963085097:web:c416eeaa23f19b0ae97338",
  measurementId: "G-V6HEH1S2B1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      name: user.displayName,
      email: user.email,
      googleId: user.uid,
      avatar: user.photoURL,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};
