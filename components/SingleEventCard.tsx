import React, { useRef } from 'react';
import { LifeEvent } from '../types';
import { toPng } from 'html-to-image';
import { Download, Zap, Anchor, Calendar, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { formatCurrency } from '../utils/logic';

interface SingleEventCardProps {
    event: LifeEvent;
    entryPrice?: number;
    markPrice?: number;
}

export const SingleEventCard: React.FC<SingleEventCardProps> = ({ event, entryPrice, markPrice }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = `aura-event-${event.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download', err);
      }
    }
  };

  const isPositive = event.impact >= 0;

  return (
    <div className="flex flex-col gap-3 group">
        <div ref={cardRef} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md relative overflow-hidden w-[280px] shrink-0 transition-transform hover:-translate-y-1 duration-300">
            {/* Background Gradient */}
            <div className={clsx("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 pointer-events-none", isPositive ? "bg-primary" : "bg-danger")}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <Logo className="w-5 h-5 text-gray-400" />
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    Receipt
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2 min-h-[1.5em]">{event.name}</h3>
            <div className="text-xs text-gray-400 flex items-center gap-1 mb-6 font-mono">
                <Calendar size={10} />
                {new Date(event.date).toLocaleDateString()}
            </div>

            <div className="flex justify-between items-end mb-4">
                 <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Net Impact</div>
                    <div className={clsx("text-4xl font-black font-mono tracking-tighter", isPositive ? "text-primary" : "text-danger")}>
                        {isPositive ? '+' : ''}{event.impact}
                    </div>
                 </div>
                 <div className="text-right space-y-1.5">
                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 font-bold uppercase">
                        <Zap size={10} /> Int: {event.intensity}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 font-bold uppercase">
                        <Anchor size={10} /> Stick: {event.stickiness}
                    </div>
                 </div>
            </div>

            {/* Price Data Grid */}
            {(entryPrice !== undefined && markPrice !== undefined) && (
                <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <div>
                        <div className="text-[8px] uppercase font-bold text-gray-400">Entry</div>
                        <div className="font-mono text-xs font-bold text-gray-600 dark:text-gray-300">{formatCurrency(entryPrice)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[8px] uppercase font-bold text-gray-400">Close</div>
                        <div className="font-mono text-xs font-bold text-gray-600 dark:text-gray-300">{formatCurrency(markPrice)}</div>
                    </div>
                </div>
            )}

            {/* Visual Bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                <div 
                    className={clsx("h-full", isPositive ? "bg-primary" : "bg-danger")} 
                    style={{ width: `${Math.abs(event.impact) * 10}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between text-[8px] text-gray-300 dark:text-gray-600 uppercase font-bold tracking-widest border-t border-gray-100 dark:border-gray-700 pt-3">
                <span>Aura OS</span>
                <span>Verified Log</span>
            </div>
        </div>
        
        <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
            <Download size={14} /> Download Card
        </button>
    </div>
  );
}