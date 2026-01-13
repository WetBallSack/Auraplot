
import React, { useEffect, useState } from 'react';
import { generateMorningBrief } from '../services/ai';
import { SavedSession } from '../types';
import { Terminal, RefreshCw, Zap } from 'lucide-react';

interface TerminalFeedProps {
    sessions: SavedSession[];
    userName: string;
    language: string;
}

export const TerminalFeed: React.FC<TerminalFeedProps> = ({ sessions, userName, language }) => {
    const [brief, setBrief] = useState('');
    const [loading, setLoading] = useState(false);
    const [typedBrief, setTypedBrief] = useState('');

    const fetchBrief = async () => {
        setLoading(true);
        setBrief(''); 
        setTypedBrief('');
        
        // Artificial delay for "processing" feel if API is too fast, enhances the "Terminal" vibe
        const minTime = new Promise(resolve => setTimeout(resolve, 1500));
        const apiCall = generateMorningBrief(sessions, userName, language);
        
        const [_, text] = await Promise.all([minTime, apiCall]);
        setBrief(text);
        setLoading(false);
    };

    useEffect(() => {
        // Only fetch if we have a user name, to avoid initial empty calls
        if (userName) {
            fetchBrief();
        }
    }, [sessions.length, language]); // Re-fetch if new sessions added or language changes

    // Typewriter effect logic
    useEffect(() => {
        if (!brief) return;
        
        // Reset
        setTypedBrief('');
        
        let i = 0;
        const speed = 20; // ms per char
        
        const interval = setInterval(() => {
            if (i < brief.length) {
                // Determine next char
                const char = brief.charAt(i);
                setTypedBrief(prev => prev + char);
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [brief]);

    return (
        <div className="w-full bg-black dark:bg-black rounded-xl p-4 md:p-6 border border-gray-800 shadow-2xl relative overflow-hidden font-mono text-sm mb-8 group">
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 relative z-20 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-primary">
                    <Terminal size={16} />
                    <span className="font-bold tracking-widest uppercase text-xs">Aura_Analyst_Feed</span>
                </div>
                <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] text-primary uppercase font-bold">Live</span>
                     </div>
                     <button 
                        onClick={fetchBrief} 
                        className="text-gray-500 hover:text-primary transition-colors disabled:opacity-50 disabled:animate-spin"
                        disabled={loading}
                        title="Refresh Feed"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-20 min-h-[80px] text-gray-300 leading-relaxed text-sm md:text-base">
                {loading ? (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Zap size={14} />
                        <span>Processing bio-market data... Calculating alpha...</span>
                    </div>
                ) : (
                    <div>
                        {typedBrief}
                        <span className="animate-pulse inline-block w-2 h-4 bg-primary align-middle ml-1"></span>
                    </div>
                )}
            </div>
            
            {/* Footer / Decorative Text */}
            <div className="absolute bottom-2 right-2 text-[8px] text-gray-800 z-20 uppercase font-bold tracking-widest">
                GEMINI-3-FLASH // V.3.1.0
            </div>
        </div>
    );
};
