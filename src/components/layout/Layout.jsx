import React from 'react';

export const Layout = ({ children }) => {
  return (
    // CAMBIAMENTO PRINCIPALE: h-[100dvh] invece di min-h-screen
    // Questo forza il contenitore ad essere alto esattamente quanto lo schermo.
    <div className="h-[100dvh] bg-slate-100 flex justify-center">
      
      {/* Contenitore App Mobile */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* flex-1: occupa tutto lo spazio disponibile
           overflow-y-auto: abilita lo scroll SOLO per il contenuto interno
        */}
        <main className="flex-1 overflow-y-auto p-4 pb-24">
          {children}
        </main>
        
        {/* Eventuale Bottom Bar andrebbe qui, fissa in basso */}
      </div>
    </div>
  );
};