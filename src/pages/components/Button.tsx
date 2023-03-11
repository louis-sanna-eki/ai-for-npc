import React, { ReactNode, MouseEventHandler, ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className?: string;
  };

function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md font-bold bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
