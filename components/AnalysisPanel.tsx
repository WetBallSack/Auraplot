import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Minus, Target, Activity, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/logic';
import clsx from 'clsx';

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis }) => {
  const isBullish = analysis.sentiment === 'Bullish';
  const isBearish = analysis.sentiment === 'Bearish';
  
  const accentColor = isBullish 
    ? 'text-primary' 
    : isBearish 
      ? 'text-danger' 
      : 'text-gray-400';
  
  const bgColor = isBullish
    ? 'bg-green-50 dark:bg-green-900/10'
    : isBearish
      ? 'bg-red-50 dark:bg-red-900/10'
      : 'bg-gray-50 dark:bg-gray-800';
      
  const borderColor = isBullish
    ? 'border-primary/20'
    : isBearish
      ? 'border-danger/20'
      : 'border-gray-200 dark:border-gray-700';

  return (
    <div className={clsx("w-full p-6 rounded-3xl border transition-colors", bgColor, borderColor)}>
      <div className="flex items-center gap-3 mb-6">
        <div className={clsx("p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm", accentColor)}>
          <Activity size={20} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Aura Predictive Model
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Sentiment */}
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {isBullish && <TrendingUp size={48} className="text-primary" />}
                {isBearish && <TrendingDown size={48} className="text-danger" />}
                {!isBullish && !isBearish && <Minus size={48} className="text-gray-400" />}
                
                <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Projected Trend</div>
                    <div className={clsx("text-4xl font-black tracking-tight", accentColor)}>
                        {analysis.sentiment}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-l-2 pl-4 border-gray-200 dark:border-gray-700">
                {analysis.description}
            </p>

            <div className="flex items-center gap-8 pt-2">
                 <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-1">
                        <Target size={12} /> Target
                    </div>
                    <div className="font-mono text-xl font-bold text-gray-800 dark:text-gray-200">
                        {formatCurrency(analysis.targetPrice)}
                    </div>
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 uppercase font-bold mb-1">
                        <span>Confidence</span>
                        <span>{analysis.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={clsx("h-full rounded-full", isBullish ? 'bg-primary' : isBearish ? 'bg-danger' : 'bg-gray-400')}
                        />
                    </div>
                 </div>
            </div>
        </div>

        {/* Signals List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <Zap size={12} /> Key Technical Signals
            </div>
            <ul className="space-y-3">
                {analysis.signals.map((signal, idx) => (
                    <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                        <span className={clsx("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", 
                            signal.includes('Bullish') || signal.includes('Green') || signal.includes('Strength') || signal.includes('Golden') ? 'bg-primary' :
                            signal.includes('Bearish') || signal.includes('Red') || signal.includes('Weakness') || signal.includes('Death') ? 'bg-danger' : 'bg-gray-400'
                        )}></span>
                        {signal}
                    </motion.li>
                ))}
                {analysis.signals.length === 0 && (
                    <li className="text-xs text-gray-400 italic">No strong signals detected.</li>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
};