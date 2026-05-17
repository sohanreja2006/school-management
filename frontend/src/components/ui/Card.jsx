import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, title, subtitle, icon: Icon }) => {
  return (
    <div className={twMerge('bg-white dark:bg-secondary-800 rounded-[2rem] border border-secondary-100 dark:border-secondary-700 shadow-sm transition-all duration-300 hover:shadow-md', className)}>
      {(title || Icon) && (
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-bold text-secondary-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl">
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      )}
      <div className="px-8 pb-8">
        {children}
      </div>
    </div>
  );
};

export default Card;
