import React, { useRef, useState } from 'react';
import { LifeEvent } from '../types';
import { toPng } from 'html-to-image';
import { Download, Zap, Anchor, Calendar, FileText, X, ExternalLink, Image, Video, Music } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from './Logo';
import { formatCurrency } from '../utils/logic';
import { motion, AnimatePresence } from 'framer-motion';

interface SingleEventCardProps {
    event: LifeEvent;
    entryPrice?: number;
    markPrice?: number;
}

export const SingleEventCard: React.FC<SingleEventCardProps> = ({ event, entryPrice, markPrice }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  const hasContent = event.description || (event.attachments && event.attachments.length > 0);

  return (
    <>
        <div className="flex flex-col gap-3 group">
            <div 
                ref={cardRef} 
                onClick={() => hasContent && setIsExpanded(true)}
                className={clsx(
                    "bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md relative overflow-hidden w-[280px] shrink-0 transition-transform duration-300",
                    hasContent ? "cursor-pointer hover:-translate-y-1" : ""
                )}
            >
                {/* Background Gradient */}
                <div className={clsx("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 pointer-events-none", isPositive ? "bg-primary" : "bg-danger")}></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <Logo className="w-5 h-5 text-gray-400" />
                    <div className="flex items-center gap-2">
                        {hasContent && (
                            <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[8px] font-bold text-gray-500 dark:text-gray-300 flex items-center gap-1">
                                <FileText size={8} /> JOURNAL
                            </div>
                        )}
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                            Receipt
                        </div>
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

        {/* Expanded Journal Modal */}
        <AnimatePresence>
            {isExpanded && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        layoutId={`card-${event.id}`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className={clsx("w-3 h-3 rounded-full", isPositive ? "bg-primary" : "bg-danger")}></div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.name}</h3>
                                    <div className="text-xs text-gray-400 font-mono">{new Date(event.date).toLocaleString()}</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                            
                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                                    <div className="text-[10px] uppercase font-bold text-gray-400">Impact</div>
                                    <div className={clsx("text-2xl font-mono font-bold", isPositive ? "text-primary" : "text-danger")}>
                                        {event.impact}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                                    <div className="text-[10px] uppercase font-bold text-gray-400">Intensity</div>
                                    <div className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300">
                                        {event.intensity}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                                    <div className="text-[10px] uppercase font-bold text-gray-400">Stickiness</div>
                                    <div className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300">
                                        {event.stickiness}
                                    </div>
                                </div>
                            </div>

                            {/* Journal Text */}
                            {event.description && (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <FileText size={14} /> Terminal Log
                                    </div>
                                    <div className="bg-black text-gray-300 font-mono text-sm p-6 rounded-xl leading-relaxed whitespace-pre-wrap shadow-inner border border-gray-800">
                                        {event.description}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {event.attachments && event.attachments.length > 0 && (
                                <div className="space-y-3">
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Assets</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {event.attachments.map(att => (
                                            <a 
                                                key={att.id} 
                                                href={att.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-primary transition-colors">
                                                    {att.type === 'image' && <Image size={18} />}
                                                    {att.type === 'video' && <Video size={18} />}
                                                    {att.type === 'audio' && <Music size={18} />}
                                                    {att.type === 'link' && <ExternalLink size={18} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-200 capitalize">{att.type} Asset</div>
                                                    <div className="text-[10px] text-gray-400 truncate">{att.url}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
  );
}