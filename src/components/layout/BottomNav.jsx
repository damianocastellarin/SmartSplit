import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Search, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  // Se non sei loggato (sei nella pagina Welcome), non mostrare il menu
  if (!user) return null;

  // Non mostrare il menu se sei dentro una pagina di dettaglio gruppo (opzionale, ma spesso più pulito)
  // Rimuovi questa riga se vuoi il menu anche dentro i gruppi
  // if (location.pathname.startsWith('/group/')) return null;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Crea', path: '/create-group', icon: PlusSquare },
    { label: 'Unisciti', path: '/join-group', icon: Search },
    // Puoi aggiungere Profilo in futuro
    // { label: 'Profilo', path: '/profile', icon: User }, 
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none">
      {/* Container limitato a max-w-md per coerenza col layout desktop */}
      <div className="w-full max-w-md bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-auto">
        <nav className="flex items-center justify-around h-16 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {({ isActive }) => (
                  <>
                    {/* Icona con riempimento leggero se attiva */}
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-all",
                        isActive && "fill-current/20 scale-110"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-medium tracking-wide">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}