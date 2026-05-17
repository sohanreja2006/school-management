import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  disabled,
  type,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 focus:ring-primary-500/30 shadow-glow hover:shadow-premium-hover',
    secondary: 'bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm text-secondary-900 dark:text-white border border-secondary-200/50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700 focus:ring-secondary-500/20 shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500/30 hover:shadow-glow',
    ghost: 'text-secondary-600 dark:text-secondary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400',
    danger: 'bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-500 hover:to-accent-400 focus:ring-accent-500/30 shadow-glow-accent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      type={type || 'button'}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={Boolean(disabled) || Boolean(isLoading)}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-5 h-5 mr-2 shrink-0" aria-hidden />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
