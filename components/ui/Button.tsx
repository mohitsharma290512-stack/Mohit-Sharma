import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // 15D: "Capsule Physics"
  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none active:scale-95 tracking-wide";
  
  const variants = {
    primary: "bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4),0_4px_6px_-2px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(79,70,229,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 border border-transparent",
    secondary: "bg-white/80 backdrop-blur-md text-slate-800 border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] hover:bg-white hover:shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)]",
    outline: "border-2 border-indigo-200/50 bg-white/10 text-indigo-700 hover:bg-white/40 hover:border-indigo-300 backdrop-blur-sm shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-white/30 hover:text-indigo-700 hover:shadow-sm",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-7 text-sm",
    lg: "h-16 px-10 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* 15D Gloss Shine */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
      
      {isLoading ? (
        <span className="mr-2 flex items-center relative z-10">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </span>
      ) : (
        <span className="relative z-10 flex items-center">{children}</span>
      )}
    </button>
  );
};