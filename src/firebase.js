import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// La tua configurazione (quella che mi hai mandato)
const firebaseConfig = {
 // Invece di: apiKey: "AIzaSy...", usa:
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "smartsplit-9c2e6.firebaseapp.com",
  projectId: "smartsplit-9c2e6",
  storageBucket: "smartsplit-9c2e6.firebasestorage.app",
  messagingSenderId: "541796635824",
  appId: "1:541796635824:web:d1b57c637085f98479d775",
  measurementId: "G-9H9MPJNNXC"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// ESPORTA I SERVIZI (Fondamentale!)
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;