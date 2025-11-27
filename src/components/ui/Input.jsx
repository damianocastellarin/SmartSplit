import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, type = "text", ...props }, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          error && "border-danger focus:ring-danger", // Bordo rosso se c'è errore
          className
        )}
        ref={ref}
        {...props}
      />
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