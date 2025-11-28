import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartsplit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username) => {
    const newUser = {
      id: crypto.randomUUID(),
      name: username,
      isGuest: false
    };
    setUser(newUser);
    localStorage.setItem('smartsplit_user', JSON.stringify(newUser));
  };

  const continueAsGuest = () => {
    const guestUser = {
      id: 'guest',
      name: 'Ospite',
      isGuest: true
    };
    setUser(guestUser);
    localStorage.setItem('smartsplit_user', JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartsplit_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, continueAsGuest, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};