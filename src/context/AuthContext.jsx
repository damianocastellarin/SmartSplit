import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification 
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedGuest = localStorage.getItem('smartsplit_guest');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified, // Importante: tracciamo se è verificato
          isGuest: false
        });
        localStorage.removeItem('smartsplit_guest');
      } else if (savedGuest) {
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
    await sendEmailVerification(res.user); // Invia il link
    
    // Aggiorniamo lo stato locale
    setUser({
      id: res.user.uid,
      name: name,
      email: res.user.email,
      emailVerified: false, // Appena creato non è verificato
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

  const resendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // Funzione per controllare manualmente se l'utente ha cliccato il link
  const checkVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload(); // Ricarica i dati da Firebase
      if (auth.currentUser.emailVerified) {
        setUser(prev => ({ ...prev, emailVerified: true }));
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, continueAsGuest, resendVerification, checkVerification, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};