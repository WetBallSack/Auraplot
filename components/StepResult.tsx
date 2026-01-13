import React, { useMemo, useState, useEffect } from 'react';
import { OHLC, MarketSummary, LifeEvent, Timeframe } from '../types';
import { Chart } from './Chart';
import { PNLCard } from './PNLCard';
import { SingleEventCard } from './SingleEventCard';
import { AnalysisPanel } from './AnalysisPanel';
import { ArrowLeft, Save, Loader2, Check, ZoomIn } from 'lucide-react';
import { analyzeMarket } from '../utils/analysis';
import { generateMarketHistory } from '../utils/logic';
import { api } from '../services/api';
import clsx from 'clsx';

interface StepResultProps {
  history: OHLC[];
  summary: MarketSummary;
  periodName: string;
  initialScore: number;
  events: LifeEvent[];
  onReset: () => void;
  isPro: boolean;
  sessionId?: string; // If editing an existing session
}

export const StepResult: React.FC<StepResultProps> = ({ 
  history: initialHistory, summary: initialSummary, periodName, initialScore, events, onReset, isPro, sessionId 
}) => {
  
  // State for timeframe adjustments
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [activeHistory, setActiveHistory] = useState<OHLC[]>(initialHistory);
  const [activeSummary, setActiveSummary] = useState<MarketSummary>(initialSummary);

  // Re-generate data when timeframe changes
  useEffect(() => {
    // We only regenerate if timeframe changes. 
    // Initial load uses props, subsequent uses local generation.
    const { history, summary } = generateMarketHistory(initialScore, events, timeframe);
    setActiveHistory(history);
    setActiveSummary(summary);
  }, [timeframe, initialScore, events]);

  const analysis = useMemo(() => analyzeMarket(activeHistory), [activeHistory]);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);

  const handleSaveSession = async () => {
    setSaving(true);
    try {
        const savedSession = await api.saveSession({
            id: currentSessionId,
            name: periodName,
            initial_score: initialScore,
            events: events
        });
        setCurrentSessionId(savedSession.id);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
        console.error(e);
        alert(`Failed to save session: ${e.message || "Unknown error"}.`);
    } finally {
        setSaving(false);
    }
  };

  // Helper to find price at event time
  const getEventPrices = (event: LifeEvent) => {
      // Find the candle closest to the event date
      // Since activeHistory can be 1D, we need to be careful matching.
      // Ideally we check if the event date is within the candle time range.
      const eventTime = new Date(event.date).getTime();
      
      // Since data is sorted by time
      const candle = activeHistory.find(c => {
          // If 1D, c.time is string YYYY-MM-DD
          // If intraday, c.time is unix seconds
          if (typeof c.time === 'string') {
               const cDate = new Date(c.time);
               // Check if event matches this day (ignoring time for daily lookup simplicity)
               const eDate = new Date(event.date);
               return cDate.toISOString().split('T')[0] === eDate.toISOString().split('T')[0];
          } else {
               // Intraday
               return (c.time as number) * 1000 >= eventTime; // First candle after or at event
          }
      });
      
      return {
          entry: candle ? candle.open : initialScore,
          mark: activeSummary.close
      };
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <button onClick={onReset} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-accent dark:text-white">Session Closed</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Here is your performance analysis.</p>
            </div>
        </div>
        
        <button 
            onClick={handleSaveSession}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                saved 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-accent text-white dark:bg-white dark:text-black hover:shadow-lg'
            }`}
        >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Session'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Chart & Analysis */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
             {/* Chart Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price Action</h3>
                        <div className="text-xs font-mono text-gray-400 dark:text-gray-500">{periodName}</div>
                    </div>
                    
                    {/* Timeframe Selector */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {(['1H', '4H', '1D'] as Timeframe[]).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={clsx(
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                    timeframe === tf 
                                        ? "bg-white dark:bg-gray-600 text-primary shadow-sm" 
                                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 min-h-[350px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl relative overflow-hidden">
                    <Chart data={activeHistory} isPro={isPro} />
                </div>
                
                <div className="mt-4 grid grid-cols-3 text-center text-xs text-gray-500 dark:text-gray-400">
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-gray-100">{events.length}</span>
                        Trades Executed
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-gray-100">{activeSummary.volume}</span>
                        Vol. Index
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-gray-100">{initialScore} &rarr; {activeSummary.close}</span>
                        Range
                    </div>
                </div>
            </div>

            {/* Technical Analysis */}
            <AnalysisPanel analysis={analysis} />

            {/* Individual Event Cards */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-accent dark:text-white">Event Receipts</h3>
                     <span className="text-xs text-gray-400 font-medium">Downloadable Assets</span>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar -mx-2 px-2">
                    {events.map(e => {
                        const prices = getEventPrices(e);
                        return (
                            <SingleEventCard 
                                key={e.id} 
                                event={e} 
                                entryPrice={prices.entry} 
                                markPrice={prices.mark} 
                            />
                        );
                    })}
                    {events.length === 0 && (
                        <div className="text-gray-400 italic text-sm py-4">No events recorded for this session.</div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: PNL Card */}
        <div className="lg:w-[380px] flex flex-col items-center">
            <div className="sticky top-8 w-full flex flex-col items-center">
                <PNLCard 
                    summary={activeSummary}
                    periodName={periodName} 
                    events={events} 
                    initialScore={initialScore} 
                />
                
                <div className="mt-8 text-center px-6">
                    <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
                        Disclaimer: This prediction is a simulation based on your input events. It is not financial or psychological advice.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};