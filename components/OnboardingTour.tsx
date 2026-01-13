
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, X, Terminal, Target, History, Settings, CheckSquare } from 'lucide-react';
import { Logo } from './Logo';

interface TourStep {
  targetId?: string; // If undefined, it's a centered modal
  titleKey: string;
  descKey: string;
  icon?: React.ReactNode;
}

export const OnboardingTour: React.FC = () => {
  const { t } = useLanguage();
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    { 
        titleKey: 'tour.welcome_title', 
        descKey: 'tour.welcome_desc',
        targetId: undefined 
    },
    { 
        titleKey: 'tour.add_title', 
        descKey: 'tour.add_desc',
        targetId: 'tour-start-session',
        icon: <Target size={16} />
    },
    {
        titleKey: 'tour.history_title',
        descKey: 'tour.history_desc',
        targetId: 'tour-history',
        icon: <History size={16} />
    },
    {
        titleKey: 'tour.checklist_title', // You might need to add this key to translations.ts or it will fallback to key
        descKey: 'tour.checklist_desc',
        targetId: 'tour-checklist-tab',
        icon: <CheckSquare size={16} />
    },
    {
        titleKey: 'tour.settings_title',
        descKey: 'tour.settings_desc',
        targetId: 'tour-settings',
        icon: <Settings size={16} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  // Measure target position
  useLayoutEffect(() => {
    const targetId = steps[currentStep].targetId;
    if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
            // Scroll element into view smoothly if needed
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const updateRect = () => {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);
            };
            
            updateRect();
            window.addEventListener('resize', updateRect);
            window.addEventListener('scroll', updateRect);
            
            return () => {
                window.removeEventListener('resize', updateRect);
                window.removeEventListener('scroll', updateRect);
            };
        }
    } else {
        setTargetRect(null);
    }
  }, [currentStep]);

  const activeStep = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
        
        {/* Backdrop */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-[2px]"
        />

        {/* Spotlights and Tooltips */}
        <div className="relative w-full h-full pointer-events-none">
            
            {/* Center Modal (Step 0) */}
            {!activeStep.targetId && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl pointer-events-auto"
                >
                    <div className="flex justify-center mb-6 text-primary">
                        <Logo className="w-16 h-16" />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-4 text-accent dark:text-white">
                        {t(activeStep.titleKey)}
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {t(activeStep.descKey)}
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={handleSkip}
                            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {t('tour.skip')}
                        </button>
                        <button 
                            onClick={handleNext}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-colors"
                        >
                            {t('tour.start_tour')}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Target Highlight & Tooltip */}
            {activeStep.targetId && targetRect && (
                <>
                    {/* The Hole / Spotlight Border */}
                    <motion.div
                        layoutId="highlight"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1,
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16
                        }}
                        transition={{ type: "spring", stiffness: 150, damping: 30 }}
                        className="absolute rounded-3xl border-2 border-primary shadow-[0_0_50px_rgba(0,200,150,0.3)] bg-transparent pointer-events-none z-[102]"
                    />

                    {/* Tooltip Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0,
                            // Attempt to position nicely. If target is in top half, show below. If bottom half, show above.
                            top: targetRect.top + targetRect.height + 24 > window.innerHeight - 200 
                                ? targetRect.top - 220 // Show above
                                : targetRect.top + targetRect.height + 24, // Show below
                            left: Math.max(16, Math.min(window.innerWidth - 336, targetRect.left + (targetRect.width / 2) - 160))
                        }}
                        transition={{ duration: 0.4 }}
                        className="absolute w-[320px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-2xl z-[102] pointer-events-auto"
                    >
                        <div className="flex items-center gap-2 mb-2 text-primary">
                             {activeStep.icon || <Target size={16} />}
                             <span className="text-xs font-bold uppercase tracking-widest">{currentStep} / {steps.length - 1}</span>
                        </div>
                        <h3 className="text-lg font-bold text-accent dark:text-white mb-2">{t(activeStep.titleKey)}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            {t(activeStep.descKey)}
                        </p>
                        
                        <div className="flex justify-between items-center">
                            <button onClick={handleSkip} className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                {t('tour.skip')}
                            </button>
                            <button 
                                onClick={handleNext}
                                className="bg-accent dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                {currentStep === steps.length - 1 ? t('tour.finish') : t('tour.next')} <ArrowRight size={12} />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}

        </div>
      </div>
    </AnimatePresence>
  );
};
