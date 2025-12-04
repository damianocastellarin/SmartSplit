import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importa questo

const firebaseConfig = {
  apiKey: "AIzaSyD_4CJlIkIWGL3vJhmnVP5zhouA1uiQWSY",
  authDomain: "smartsplit-9c2e6.firebaseapp.com",
  projectId: "smartsplit-9c2e6",
  storageBucket: "smartsplit-9c2e6.firebasestorage.app",
  messagingSenderId: "541796635824",
  appId: "1:541796635824:web:d1b57c637085f98479d775",
  measurementId: "G-9H9MPJNNXC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // ESPORTA IL DATABASE
export default app;