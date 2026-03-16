// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCP4U1gRuMeblfghFoY-KVkBXY6h9ozFnk",
  authDomain: "vera-by-kamakshi.firebaseapp.com",
  projectId: "vera-by-kamakshi",
  storageBucket: "vera-by-kamakshi.firebasestorage.app",
  messagingSenderId: "627256412925",
  appId: "1:627256412925:web:6f4bdb71762b8d3a294c94",
  measurementId: "G-LLMS8RF5LH"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
