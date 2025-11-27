import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function Modal({ isOpen, onClose, title, children, className }) {
  // Chiude la modale se si preme ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay scuro (cliccando fuori si chiude) */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className={cn(
        "relative w-full max-w-lg transform rounded-xl bg-white p-6 shadow-xl transition-all", 
        className
      )}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold leading-6 text-slate-900">
            {title}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {children}
      </div>
    </div>
  );
}