import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD1Wn3crPIzD7Lnj-ok1K17nOVA2D7VlLM",
  authDomain: "mm-systems-502601.firebaseapp.com",
  projectId: "mm-systems-502601",
  storageBucket: "mm-systems-502601.firebasestorage.app",
  messagingSenderId: "710608157926",
  appId: "1:710608157926:web:d1d694325b3936e2890f27",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analyticsPromise: Promise<Analytics | null> = isSupported().then(
  (supported) => (supported ? getAnalytics(app) : null)
);

const db = getFirestore(app, "ai-studio-restaurantmanage-52d616c8-bb7a-4289-baee-70e8fbc3ce25");

const auth = getAuth(app);

export { app, analyticsPromise, db, auth };
