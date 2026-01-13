import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Logo } from './Logo';

interface FAQProps {
  onBack: () => void;
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-6 text-left focus:outline-none group"
            >
                <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">{question}</span>
                {isOpen ? <ChevronUp className="text-gray-400" size={18} /> : <ChevronDown className="text-gray-400" size={18} />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  const faqs = [
    {
        q: "What is 'Personal PNL'?",
        a: "Personal PNL (Profit & Loss) is a metaphorical metric to quantify your emotional and life progress. Positive events generate 'profit', while setbacks cause 'losses'. It tracks your net well-being over time."
    },
    {
        q: "Is my data private?",
        a: "Yes. Your entries are stored securely in Supabase with row-level security. We do not sell your personal life logs to third parties. You can delete your account and all data at any time from the Settings menu."
    },
    {
        q: "How does the 'Liquidation Risk' work?",
        a: "Liquidation Risk represents burnout. If your emotional 'account balance' drops below a critical threshold (usually 15/100), the system flags it as a high-risk state where you might need to stop trading (resting) to recover."
    },
    {
        q: "Can I use Aura for financial tracking?",
        a: "Aura is primarily a psychological tool using financial metaphors. While you *can* log financial wins/losses as life events, it is not a substitute for a bank ledger or accounting software."
    },
    {
        q: "What benefits does Aura Pro offer?",
        a: "Aura Pro unlocks the full 24-hour timeline visualization, unlimited session history, 4K exports for print, and advanced AI-driven analysis of your habits."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex flex-col items-center pt-12 pb-24 px-4 transition-colors font-sans"
    >
      <div className="fixed top-8 left-8 z-50">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
            <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-primary">
                <HelpCircle className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Understanding the Aura Protocol</p>
            </div>
        </div>

        <div>
            {faqs.map((item, idx) => (
                <FAQItem key={idx} question={item.q} answer={item.a} />
            ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400">
                Still have questions? Contact support@auraplot.site
            </p>
        </div>
      </div>
    </motion.div>
  );
};