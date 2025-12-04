import React from 'react';
import BottomNav from './BottomNav'; // Importa il menu

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Container App Mobile */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Main Content: pb-20 serve per non far coprire l'ultimo elemento dal menu */}
        <main className="flex-1 overflow-y-auto p-4 pb-24">
          {children}
        </main>
        
        {/* Menu in basso */}
        <BottomNav />
        
      </div>
    </div>
  );
};