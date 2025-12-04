import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail // Importiamo la funzione per il reset
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
          emailVerified: firebaseUser.emailVerified,
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
    await sendEmailVerification(res.user);
    
    setUser({
      id: res.user.uid,
      name: name,
      email: res.user.email,
      emailVerified: false,
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

  const checkVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setUser(prev => ({ ...prev, emailVerified: true }));
        return true;
      }
    }
    return false;
  };

  // NUOVA FUNZIONE: Reset Password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signup, 
      login, 
      logout, 
      continueAsGuest, 
      resendVerification, 
      checkVerification, 
      resetPassword, // Esportiamo la nuova funzione
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};