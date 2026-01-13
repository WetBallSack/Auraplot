
import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#F9FAFB] dark:bg-[#050505] flex flex-col items-center justify-center font-sans transition-colors duration-500">
      <div className="relative flex items-center justify-center">
        {/* Core Logo */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-20 text-gray-900 dark:text-white"
        >
            <Logo className="w-12 h-12" />
        </motion.div>
        
        {/* Pulsing Aura Behind */}
        <motion.div 
            animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.2, 0.1, 0.2] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-primary/30 rounded-full blur-xl z-0"
        />

        {/* Outer Rotating Dashed Ring */}
        <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute w-40 h-40 border border-dashed border-gray-300 dark:border-gray-800 rounded-full z-0 opacity-40"
        />

        {/* Inner Fast Spinner */}
         <motion.div
            className="absolute w-20 h-20 border-t border-r border-primary rounded-full z-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Counter-Rotating Accents */}
        <motion.div
            className="absolute w-28 h-28 border-b border-l border-gray-300 dark:border-gray-700 rounded-full z-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Text Status */}
      <div className="mt-16 space-y-3 text-center">
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white"
        >
            Aura Terminal
        </motion.div>
        
        <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-1/2 h-full bg-primary/50 blur-[1px]"
                />
            </div>
            <div className="text-[9px] font-mono text-gray-400 flex items-center justify-center gap-1">
                <span>ESTABLISHING CONNECTION</span>
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >_</motion.span>
            </div>
        </div>
      </div>
    </div>
  );
};
