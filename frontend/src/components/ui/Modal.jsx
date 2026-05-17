import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-secondary-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-secondary-100 dark:border-secondary-700/50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
          </button>
        </div>
        
        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-8 py-6 border-t border-secondary-100 dark:border-secondary-700/50 bg-secondary-50 dark:bg-secondary-900/50 flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
