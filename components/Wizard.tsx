
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Step, LifeEvent, OHLC, MarketSummary, SavedSession } from '../types';
import { StepIntro } from './StepIntro';
import { StepEvents } from './StepEvents';
import { StepResult } from './StepResult';
import { generateMarketHistory } from '../utils/logic';
import { Logo } from './Logo';
import { X, Trash2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { api } from '../services/api';

interface WizardProps {
    onExit: () => void;
    isPro: boolean;
    existingSession?: SavedSession | null;
}

export const Wizard: React.FC<WizardProps> = ({ onExit, isPro, existingSession }) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.INTRO);
  
  // State
  const [periodName, setPeriodName] = useState('My Session'); 
  const [initialScore, setInitialScore] = useState(50);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  
  // New Result State
  const [history, setHistory] = useState<OHLC[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);

  // Initialize from existing session if present
  useEffect(() => {
    if (existingSession) {
        setInitialScore(existingSession.initial_score);
        setEvents(existingSession.events || []);
        setPeriodName(existingSession.name);
        // We start at events if editing, or intro? Let's start at Intro to review baseline, or Events for speed.
        // Starting at Events feels more natural for "Adding new events"
        setCurrentStep(Step.EVENTS);
    }
  }, [existingSession]);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleCalculate = () => {
    // Generate full time-series history
    const { history: hist, summary: sum, periodName: derivedName } = generateMarketHistory(initialScore, events);
    
    setHistory(hist);
    setSummary(sum);
    // Keep user defined name if editing, otherwise use derived
    if (!existingSession) {
        setPeriodName(derivedName);
    }
    setCurrentStep(Step.RESULT);
  };

  const handleReset = () => {
    if (existingSession) {
        // If resetting in edit mode, go back to events
        setCurrentStep(Step.EVENTS);
    } else {
        setCurrentStep(Step.INTRO);
        setPeriodName('My Session');
        setInitialScore(50);
        setEvents([]);
        setHistory([]);
        setSummary(null);
    }
  };

  const handleDelete = async () => {
    if (!existingSession) return;
    if (window.confirm("Are you sure you want to delete this session?")) {
        try {
            await api.deleteSession(existingSession.id);
            onExit();
        } catch (e) {
            console.error(e);
            alert("Failed to delete session");
        }
    }
  }

  const steps = [
    {
      component: <StepIntro 
        initialScore={initialScore}
        setInitialScore={setInitialScore}
        onNext={nextStep} 
      />,
    },
    {
      component: <StepEvents 
        events={events} 
        setEvents={setEvents} 
        onNext={handleCalculate} 
      />,
    },
    {
      component: null 
    },
    {
      component: summary ? <StepResult 
        history={history}
        summary={summary}
        periodName={periodName}
        initialScore={initialScore}
        events={events}
        onReset={handleReset}
        isPro={isPro}
        sessionId={existingSession?.id}
      /> : null
    }
  ];

  // Progress Bar Width
  const progress = ((currentStep + 1) / 3) * 100;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="min-h-screen flex flex-col items-center pt-12 pb-12 px-4 relative bg-[#F9FAFB] dark:bg-gray-900 transition-colors duration-300"
    >
        {/* Header / Nav */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 z-50">
            <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${currentStep === Step.RESULT ? 100 : progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
        
        <div className="w-full max-w-5xl mb-12 flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent dark:text-white">
                <Logo className="w-8 h-8" />
                <h1 className="font-bold text-xl tracking-tight">Aura</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest hidden sm:block">
                    {existingSession ? 'Editing Session' : `Step ${Math.min(currentStep + 1, 3)} / 3`}
                </div>
                {existingSession && (
                    <button 
                        onClick={handleDelete}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Session"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
                <LanguageToggle />
                <ThemeToggle />
                <button 
                    onClick={onExit}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title="Exit Session"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full flex justify-center"
                >
                    {steps[currentStep].component}
                </motion.div>
            </AnimatePresence>
        </div>
    </motion.div>
  );
};
