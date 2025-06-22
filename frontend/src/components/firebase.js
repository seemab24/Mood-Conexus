

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxyvvdKgYgSJ5p9E5zIERpV0EMOwot7Pg",
  authDomain: "facedetect-f064e.firebaseapp.com",
  projectId: "facedetect-f064e",
  storageBucket: "facedetect-f064e.firebasestorage.app",
  messagingSenderId: "40586135061",
  appId: "1:40586135061:web:c24b7c8c5b39bc1033701c"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;