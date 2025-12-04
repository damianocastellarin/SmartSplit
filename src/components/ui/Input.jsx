import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, icon, endIcon, onEndIconClick, type = "text", ...props }, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Icona Sinistra (Opzionale) */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-300 bg-white py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            icon ? "pl-10" : "pl-3",      // Spazio a sinistra se c'è icona
            endIcon ? "pr-10" : "pr-3",   // Spazio a destra se c'è icona
            error && "border-danger focus:ring-danger",
            className
          )}
          ref={ref}
          {...props}
        />

        {/* Icona Destra (Opzionale e Cliccabile) */}
        {endIcon && (
          <div 
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400",
              onEndIconClick ? "cursor-pointer hover:text-slate-600" : "pointer-events-none"
            )}
            onClick={onEndIconClick}
          >
            {endIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export { Input };