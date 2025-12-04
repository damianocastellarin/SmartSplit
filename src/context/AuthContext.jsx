import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Controlla se c'è un utente "Ospite" salvato nel browser
    const savedGuest = localStorage.getItem('smartsplit_guest');
    
    // 2. Ascolta Firebase per utenti reali
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // UTENTE LOGGATO VERO
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          isGuest: false
        });
        // Rimuovi sessione ospite se si logga
        localStorage.removeItem('smartsplit_guest');
      } else if (savedGuest) {
        // UTENTE OSPITE (Fallback)
        setUser(JSON.parse(savedGuest));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // --- AZIONI ---

  const signup = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    // Aggiorna stato locale subito
    setUser({
      id: res.user.uid,
      name: name,
      email: res.user.email,
      isGuest: false
    });
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('smartsplit_guest');
    setUser(null);
  };

  const continueAsGuest = () => {
    const guestUser = {
      id: 'guest_' + crypto.randomUUID(),
      name: 'Ospite',
      isGuest: true
    };
    localStorage.setItem('smartsplit_guest', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, continueAsGuest, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};