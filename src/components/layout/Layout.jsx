import React from 'react';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      {/* Container che simula la viewport mobile su schermi grandi */}
      <div className="w-full max-w-md bg-background min-h-screen shadow-2xl overflow-hidden flex flex-col relative">
        <main className="flex-1 overflow-y-auto p-4 pb-24">
          {children}
        </main>
        
        {/* Qui in futuro metteremo la Bottom Navigation Bar */}
      </div>
    </div>
  );
};