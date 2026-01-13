import React from 'react';
import { motion } from 'framer-motion';

interface StepIntroProps {
  initialScore: number;
  setInitialScore: (val: number) => void;
  onNext: () => void;
}

export const StepIntro: React.FC<StepIntroProps> = ({
  initialScore,
  setInitialScore,
  onNext,
}) => {
  return (
    <div className="flex flex-col space-y-8 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-accent dark:text-white">Initialize Position</h2>
        <p className="text-gray-500 dark:text-gray-400">First, establish your baseline happiness before the events occurred.</p>
      </div>

      <div className="space-y-6">
        {/* Initial Score Input */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Opening Baseline
            </label>
            <span className="font-mono text-primary font-bold text-xl">{initialScore}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={initialScore}
            onChange={(e) => setInitialScore(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            0 = Rock Bottom, 50 = Neutral, 100 = Euphoria
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm text-blue-800 dark:text-blue-300">
           <strong>Note:</strong> You will define the time period in the next step by assigning dates to your life events.
        </div>
      </div>

      <button
        onClick={onNext}
        className="group relative w-full bg-accent dark:bg-primary text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-2 dark:text-black">
          Open Session
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>
    </div>
  );
};