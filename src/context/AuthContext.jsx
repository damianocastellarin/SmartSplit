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
    // Ascolta lo stato di login reale da Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          isGuest: false
        });
        localStorage.removeItem('smartsplit_guest'); // Pulisce sessione ospite
      } else {
        // Se non loggato, controlla se c'è un ospite salvato
        const savedGuest = localStorage.getItem('smartsplit_guest');
        setUser(savedGuest ? JSON.parse(savedGuest) : null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
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