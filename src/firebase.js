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

// Inizializza l'app
const app = initializeApp(firebaseConfig);

// Esporta i servizi per usarli nel resto dell'app
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;