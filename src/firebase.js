import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- added Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCnbjB7QqmbuyxaKtBOiEI5Do4rsKmHWrY",
  authDomain: "digima-cb2fc.firebaseapp.com",
  projectId: "digima-cb2fc",
  storageBucket: "digima-cb2fc.firebasestorage.app",
  messagingSenderId: "498606156423",
  appId: "1:498606156423:web:dd642f8202a85bc473e622",
  measurementId: "G-1E2QX3R9NH",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
