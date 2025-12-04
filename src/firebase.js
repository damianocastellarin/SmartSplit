import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_4CJlIkIWGL3vJhmnVP5zhouA1uiQWSY",
  authDomain: "smartsplit-9c2e6.firebaseapp.com",
  projectId: "smartsplit-9c2e6",
  storageBucket: "smartsplit-9c2e6.firebasestorage.app",
  messagingSenderId: "541796635824",
  appId: "1:541796635824:web:d1b57c637085f98479d775",
  measurementId: "G-9H9MPJNNXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Esporta i servizi che useremo
export const auth = getAuth(app);
export const db = getFirestore(app); // Per il database (opzionale per ora, ma pronto per il futuro)
export default app;