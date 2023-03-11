import React, { ReactNode, MouseEventHandler, ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className?: string;
  };

  function Button({ children, className = '', disabled = false, ...props }: ButtonProps) {
    const buttonStyle = disabled
      ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
      : 'bg-purple-600 hover:bg-purple-500 focus:ring-2 focus:ring-purple-400';
    
    return (
      <button
        className={`rounded-md font-bold px-4 py-2 text-sm text-white focus:outline-none ${buttonStyle} ${className}`}
        disabled={disabled}
        aria-label={disabled ? 'This button is disabled' : undefined}
        {...props}
      >
        {children}
      </button>
    );
  };
  

export default Button;
