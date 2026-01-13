import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { language, setLanguage } = useLanguage();

  const toggle = () => setLanguage(language === 'en' ? 'zh' : 'en');

  return (
    <button
      onClick={toggle}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative overflow-hidden hover:bg-gray-200 dark:hover:bg-gray-700 ${
         language === 'en'
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
      } ${className}`}
      title={language === 'en' ? "Switch to Chinese" : "Switch to English"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
            key={language}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] font-black tracking-tighter uppercase"
        >
            {language === 'en' ? 'EN' : '中'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};