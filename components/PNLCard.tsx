import React, { useRef } from 'react';
import { MarketSummary, LifeEvent } from '../types';
import { toPng } from 'html-to-image';
import { Download, Share2 } from 'lucide-react';
import { formatCurrency } from '../utils/logic';
import clsx from 'clsx';
import { Logo } from './Logo';

interface PNLCardProps {
  summary: MarketSummary;
  periodName: string;
  events: LifeEvent[];
  initialScore: number;
}

export const PNLCard: React.FC<PNLCardProps> = ({ summary, periodName, events, initialScore }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `aura-pnl-${periodName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download', err);
      }
    }
  };

  const isProfit = summary.roe >= 0;
  const pnlColor = isProfit ? 'text-primary' : 'text-danger';
  
  // Get top 3 impactful events
  const topEvents = [...events]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-sm mx-auto mt-8">
      
      {/* The Card - Designed to be screenshotted */}
      <div 
        ref={cardRef} 
        className="w-full bg-white dark:bg-gray-800 p-6 rounded-none sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-colors"
        style={{
             backgroundImage: 'radial-gradient(circle at top right, rgba(0,200,150,0.05) 0%, rgba(255,255,255,0) 60%)'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-2">
            <div className="mt-1 text-accent dark:text-white">
                <Logo className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">Aura Terminals</h3>
                <h1 className="text-2xl font-black text-accent dark:text-white mt-1">YOU / LIFE</h1>
                <div className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-500 dark:text-gray-300 mt-2">
                {periodName}
                </div>
            </div>
          </div>
          <div className="text-right">
             <div className={clsx("text-4xl font-black font-mono tracking-tighter", pnlColor)}>
                {summary.roe > 0 ? '+' : ''}{summary.roe}%
             </div>
             <div className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">ROE</div>
          </div>
        </div>

        {/* OHLC Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-center">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Open</div>
                <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-200">{formatCurrency(summary.open)}</div>
            </div>
            <div className="text-center">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">High</div>
                <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-200">{formatCurrency(summary.high)}</div>
            </div>
            <div className="text-center">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Low</div>
                <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-200">{formatCurrency(summary.low)}</div>
            </div>
            <div className="text-center">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Close</div>
                <div className="font-mono font-bold text-sm text-gray-700 dark:text-gray-200">{formatCurrency(summary.close)}</div>
            </div>
        </div>

        {/* Top Trades (Events) */}
        <div className="space-y-3 mb-6">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase border-b border-gray-100 dark:border-gray-700 pb-1">Top Movers</div>
            {topEvents.length > 0 ? topEvents.map(e => (
                <div key={e.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{e.name}</span>
                    <span className={clsx("font-mono font-bold", e.impact >= 0 ? 'text-primary' : 'text-danger')}>
                        {e.impact > 0 ? '+' : ''}{e.impact}
                    </span>
                </div>
            )) : (
                <div className="text-xs text-gray-400 dark:text-gray-500 italic">No significant movement</div>
            )}
        </div>

        {/* Liquidation Warning */}
        {summary.isLiquidationRisk && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Liquidation Warning (Burnout Imminent)</span>
            </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">Entry Price</span>
                <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-300">{formatCurrency(initialScore)}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">Mark Price</span>
                <span className={clsx("font-mono text-xl font-bold", pnlColor)}>{formatCurrency(summary.close)}</span>
             </div>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-300 dark:text-gray-600 font-bold tracking-widest opacity-50">
            AURA OS
        </div>
      </div>

      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-accent dark:text-white px-6 py-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 font-semibold text-sm hover:scale-105 transition-transform"
      >
        <Download size={16} />
        Save Receipt
      </button>
    </div>
  );
};