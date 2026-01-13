
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, TrendingUp, TrendingDown, Check, FolderPlus, Loader2, Clock, Edit2, X, AlertCircle } from 'lucide-react';
import { Order, Strategy, OHLC, SavedSession } from '../types';
import { api } from '../services/api';
import { Chart } from './Chart';
import clsx from 'clsx';

interface OrderBookProps {
    existingSessions: SavedSession[];
    onRefreshHistory: () => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({ existingSessions, onRefreshHistory }) => {
    // --- State ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    
    // Inputs
    const [taskName, setTaskName] = useState('');
    const [impact, setImpact] = useState(5); // -10 to 10
    const [intensity, setIntensity] = useState(5); // 1 to 10
    const [stickiness, setStickiness] = useState(0.5); // 0 to 1
    const [taskTime, setTaskTime] = useState(''); // HH:MM
    
    // Template Management
    const [strategyName, setStrategyName] = useState('');
    const [isSavingStrat, setIsSavingStrat] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    
    // Session Merging State
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitMode, setCommitMode] = useState<'new' | 'merge'>('new');
    const [targetSessionId, setTargetSessionId] = useState('');
    const [newSessionName, setNewSessionName] = useState(`Checklist - ${new Date().toLocaleDateString()}`);

    // Chart State
    const [chartData, setChartData] = useState<OHLC[]>([]);
    const [percentageChange, setPercentageChange] = useState(0);

    // --- Effects ---

    useEffect(() => {
        const savedOrders = localStorage.getItem('aura_checklist');
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders));
            } catch (e) { console.error("Failed to parse local checklist"); }
        }
        
        loadStrategies();
    }, []);

    useEffect(() => {
        localStorage.setItem('aura_checklist', JSON.stringify(orders));
        calculateLivePrice();
    }, [orders]);

    // --- Logic ---

    const loadStrategies = async () => {
        try {
            const strats = await api.getStrategies();
            setStrategies(strats);
        } catch (e) {
            console.error("Failed to load strategies", e);
        }
    };

    const seededRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const calculateLivePrice = () => {
        // Base: Today 00:00 to 23:59
        const today = new Date();
        today.setHours(0,0,0,0);
        const startUnix = Math.floor(today.getTime() / 1000);
        
        // 24h of 30min candles
        const intervalMinutes = 30;
        const totalPoints = (24 * 60) / intervalMinutes; 
        
        // Only consider FILLED orders that have a TIME for plotting the curve
        const filledOrders = orders
            .filter(o => o.filled && o.time) 
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        const baseline = 50;
        let currentP = baseline;
        const newChartData: OHLC[] = [];
        let seed = 12345; 

        // Identify Time Boundaries (in minutes from midnight)
        let firstTaskMinute = 24 * 60; // Default end of day
        let lastTaskMinute = 0;

        if (filledOrders.length > 0) {
            const first = filledOrders[0].time!.split(':').map(Number);
            firstTaskMinute = first[0] * 60 + first[1];

            const last = filledOrders[filledOrders.length - 1].time!.split(':').map(Number);
            lastTaskMinute = last[0] * 60 + last[1];
        }

        for (let i = 0; i <= totalPoints; i++) {
            const timeOffset = i * intervalMinutes * 60;
            const candleTime = startUnix + timeOffset;
            
            // Determine time bucket range (minutes from midnight)
            const currentBucketStart = i * intervalMinutes;
            const nextBucketStart = (i + 1) * intervalMinutes;

            // Find orders in this bucket
            const ordersInBucket = filledOrders.filter(o => {
                if (!o.time) return false;
                const [h, m] = o.time.split(':').map(Number);
                const orderMinutes = h * 60 + m;
                return orderMinutes >= currentBucketStart && orderMinutes < nextBucketStart;
            });

            let open = currentP;
            let close = currentP;
            let high = currentP;
            let low = currentP;
            let volume = 0;
            let isEvent = false;
            let eventName = '';

            // Logic:
            // 1. Before first task: Flat line at 50.
            // 2. Between first and last task: Simulate volatility + Apply events.
            // 3. After last task: Flat line at last price.

            const isBeforeFirst = currentBucketStart < firstTaskMinute;
            // Allow last bucket to process if it contains the last task
            const isAfterLast = currentBucketStart > lastTaskMinute; 

            // Regression / Drift volatility
            const timeVolatility = 0.5;

            if (ordersInBucket.length > 0) {
                // ACTIVE EVENT CANDLE
                isEvent = true;
                eventName = ordersInBucket[0].name; 
                
                ordersInBucket.forEach(o => {
                    volume += (o.intensity * 10);
                    const volatilitySpike = o.impact * (o.intensity / 5.0);
                    const permanentMove = o.impact * o.stickiness;
                    
                    const spikePrice = close + volatilitySpike;
                    high = Math.max(high, close, spikePrice);
                    low = Math.min(low, close, spikePrice);
                    
                    close = close + permanentMove;
                });
                // Ensure H/L encompass the final close
                high = Math.max(high, close);
                low = Math.min(low, close);

            } else if (!isBeforeFirst && !isAfterLast) {
                // SIMULATION ZONE (Between events)
                // Apply "Regression" / Noise drift
                const rand = seededRandom(seed++);
                const noise = (rand - 0.5) * timeVolatility;
                
                // Slight mean reversion logic (gravity towards 50)
                const gravity = (50 - open) * 0.02; 
                
                close = open + noise + gravity;

                const wickRand = seededRandom(seed++);
                const wickSize = wickRand * (timeVolatility * 0.5);
                high = Math.max(open, close) + wickSize;
                low = Math.min(open, close) - wickSize;
                
                volume = Math.floor(seededRandom(seed++) * 5);
            } else {
                // FLAT ZONE (Pre-start or Post-end)
                // Keep close = open (previous close)
                high = open;
                low = open;
                volume = 0;
            }

            newChartData.push({
                time: candleTime,
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2)),
                volume,
                isEvent,
                eventName
            });

            currentP = close;
        }

        setChartData(newChartData);
        
        // Calculate Percentage Change for the end state
        // This takes the last close price vs the baseline (50)
        const finalPrice = newChartData[newChartData.length - 1].close;
        const pctChange = ((finalPrice - baseline) / baseline) * 100;
        setPercentageChange(pctChange);
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName) return;

        const order: Order = {
            id: crypto.randomUUID(),
            name: taskName,
            impact: impact,
            intensity: intensity,
            stickiness: stickiness,
            filled: false,
            timestamp: Date.now(),
            time: taskTime || undefined
        };

        setOrders(prev => [...prev, order].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')));
        
        setTaskName('');
        setTaskTime('');
        setImpact(5);
        setIntensity(5);
        setStickiness(0.5);
    };

    const handleToggleFill = (id: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                return { ...o, filled: !o.filled, timestamp: Date.now() };
            }
            return o;
        }));
    };

    const handleRemoveOrder = (id: string) => {
        setOrders(prev => prev.filter(o => o.id !== id));
    };

    const handleSaveStrategy = async () => {
        if (!strategyName) return;
        setIsSavingStrat(true);
        try {
            if (editingStrategy) {
                await api.updateStrategy(editingStrategy.id, strategyName, orders);
                setEditingStrategy(null);
            } else {
                await api.saveStrategy(strategyName, orders);
            }
            setStrategyName('');
            loadStrategies();
        } catch (e) {
            alert("Failed to save template.");
        } finally {
            setIsSavingStrat(false);
        }
    };

    const handleLoadStrategy = (strategy: Strategy) => {
        // Prevent accidental clicks if deletion is armed on another item
        if (confirmDeleteId) {
            setConfirmDeleteId(null);
            return;
        }

        if (orders.length > 0 && !confirm("Replace current list with this template?")) return;
        
        const freshOrders = strategy.orders.map(o => ({
            ...o,
            id: crypto.randomUUID(),
            filled: false,
            timestamp: Date.now()
        }));
        setOrders(freshOrders);
        setEditingStrategy(null);
    };

    const handleEditStrategyStart = (e: React.MouseEvent, strategy: Strategy) => {
        e.stopPropagation();
        const freshOrders = strategy.orders.map(o => ({
            ...o,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        }));
        setOrders(freshOrders);
        setEditingStrategy(strategy);
        setStrategyName(strategy.name);
    };

    const handleCancelEdit = () => {
        setEditingStrategy(null);
        setStrategyName('');
        setOrders([]);
    };

    // --- DELETE LOGIC ---
    
    const handleRequestDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("[OrderBook] Requesting delete for:", id);
        
        if (confirmDeleteId === id) {
            setConfirmDeleteId(null); // Toggle off
        } else {
            setConfirmDeleteId(id);
            // Auto-reset confirmation after 4s
            setTimeout(() => {
                setConfirmDeleteId(prev => prev === id ? null : prev);
            }, 4000);
        }
    };

    const handleExecuteDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        
        console.log("[OrderBook] Executing delete for:", id);
        setConfirmDeleteId(null);
        setIsDeleting(id);
        
        try {
            await api.deleteStrategy(id);
            console.log("[OrderBook] Delete successful");
            // Force state update by filtering immediately
            setStrategies(prev => prev.filter(s => s.id !== id));
            if (editingStrategy?.id === id) handleCancelEdit();
        } catch (error: any) {
            console.error("[OrderBook] Delete failed error:", error);
            alert(`Could not delete template: ${error.message}`);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleCommitSession = async () => {
        const filled = orders.filter(o => o.filled);
        if (filled.length === 0) {
            alert("Check off at least one item to commit.");
            return;
        }

        setIsCommitting(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            
            const newEvents = filled.map(o => {
                let dateStr = new Date().toISOString(); // Default now
                if (o.time) {
                    dateStr = `${todayStr}T${o.time}:00`;
                }
                
                return {
                    id: crypto.randomUUID(),
                    name: o.name,
                    date: dateStr, 
                    impact: o.impact,
                    intensity: o.intensity,
                    stickiness: o.stickiness
                };
            });

            if (commitMode === 'new') {
                await api.saveSession({
                    name: newSessionName,
                    initial_score: 50,
                    events: newEvents
                });
            } else {
                if (!targetSessionId) throw new Error("No session selected");
                const target = existingSessions.find(s => s.id === targetSessionId);
                if (!target) throw new Error("Session not found");
                
                const mergedEvents = [...(target.events || []), ...newEvents];
                await api.saveSession({
                    id: target.id,
                    name: target.name,
                    initial_score: target.initial_score,
                    events: mergedEvents
                });
            }

            setOrders(prev => prev.filter(o => !o.filled));
            onRefreshHistory();
            alert("Checklist committed successfully.");

        } catch (e: any) {
            console.error(e);
            alert(`Commit failed: ${e.message}`);
        } finally {
            setIsCommitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row gap-8 font-sans text-gray-700 dark:text-gray-300">
            
            {/* Left Column: Input & Templates */}
            <div className="w-full lg:w-[380px] flex flex-col gap-6">
                
                {/* Add Task Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800">
                    <div className="mb-6">
                        {editingStrategy ? (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Edit2 size={14} className="text-yellow-600 dark:text-yellow-400"/>
                                        Editing: <span className="text-yellow-700 dark:text-yellow-300 truncate max-w-[120px]">{editingStrategy.name}</span>
                                    </h2>
                                </div>
                                <button 
                                    onClick={handleCancelEdit} 
                                    className="w-full py-2 bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-danger hover:border-danger transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <X size={14} /> Stop Editing
                                </button>
                            </div>
                        ) : (
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Add Item
                            </h2>
                        )}
                    </div>
                    
                    <form onSubmit={handleAddTask} className="space-y-5">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Task Name</label>
                                <input 
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    placeholder="Gym, Read, etc." 
                                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Time</label>
                                <div className="relative">
                                    <input 
                                        type="time"
                                        value={taskTime}
                                        onChange={(e) => setTaskTime(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl px-2 py-2.5 text-sm outline-none dark:text-white appearance-none pr-8"
                                    />
                                    {!taskTime && <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
                                </div>
                            </div>
                        </div>
                        
                        {/* Impact Slider */}
                        <div className="space-y-3 pt-2">
                             <div className="flex justify-between text-xs font-medium">
                                <span className={impact < 0 ? "text-danger" : "text-gray-400"}>Drain (-10)</span>
                                <span className="font-mono font-bold text-gray-800 dark:text-white">{impact > 0 ? '+' : ''}{impact}</span>
                                <span className={impact > 0 ? "text-primary" : "text-gray-400"}>Boost (+10)</span>
                             </div>
                            <input 
                                type="range"
                                min="-10" max="10" step="1"
                                value={impact}
                                onChange={(e) => setImpact(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Intensity & Stickiness */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase">
                                    <span>Intensity</span>
                                    <span className="text-gray-700 dark:text-gray-300">{intensity}</span>
                                </label>
                                <input 
                                    type="range"
                                    min="1" max="10"
                                    value={intensity}
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase">
                                    <span>Stickiness</span>
                                    <span className="text-gray-700 dark:text-gray-300">{stickiness}</span>
                                </label>
                                <input 
                                    type="range"
                                    min="0" max="1" step="0.1"
                                    value={stickiness}
                                    onChange={(e) => setStickiness(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={!taskName}
                            className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> {editingStrategy ? 'Add to Template' : 'Add to List'}
                        </button>
                    </form>
                </div>

                {/* Templates List */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800 flex-1 min-h-[200px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Templates
                        </h3>
                        {editingStrategy && <span className="text-[10px] text-primary font-bold animate-pulse">EDITING ACTIVE</span>}
                    </div>

                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                        {strategies.map(strat => (
                            <div key={strat.id} className="relative group">
                                {/* 1. Main Clickable Card - Z-10 */}
                                <div 
                                    onClick={() => handleLoadStrategy(strat)}
                                    className={clsx(
                                        "flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm relative z-10",
                                        editingStrategy?.id === strat.id 
                                            ? "bg-primary/10 border-primary/30" 
                                            : "bg-gray-50 dark:bg-zinc-800/50 border-transparent hover:bg-white dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{strat.name}</span>
                                        <span className="text-[10px] text-gray-400">{strat.orders.length} items</span>
                                    </div>
                                </div>

                                {/* 2. Action Buttons - Placed AFTER in DOM for higher stacking, Z-20 */}
                                <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleEditStrategyStart(e, strat)}
                                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-primary shadow-sm hover:z-30 cursor-pointer"
                                        title="Edit"
                                        type="button"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    
                                    <AnimatePresence mode="wait">
                                        {confirmDeleteId === strat.id ? (
                                            <motion.button
                                                key="confirm"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={(e) => handleExecuteDelete(e, strat.id)}
                                                onMouseDown={(e) => e.stopPropagation()} // Prevent double clicks
                                                className="p-1.5 rounded-lg bg-red-500 text-white border border-red-600 shadow-lg hover:bg-red-600 transition-colors flex items-center gap-1 z-50 cursor-pointer"
                                                title="Confirm Delete"
                                                type="button"
                                            >
                                                <Trash2 size={12} /> 
                                                <span className="text-[10px] font-bold pr-1">Confirm</span>
                                            </motion.button>
                                        ) : (
                                            <button 
                                                key="delete"
                                                onClick={(e) => handleRequestDelete(e, strat.id)}
                                                className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-danger shadow-sm hover:z-30 cursor-pointer"
                                                title="Delete"
                                                type="button"
                                                disabled={isDeleting === strat.id}
                                            >
                                                {isDeleting === strat.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                            </button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                        {strategies.length === 0 && <div className="text-xs text-gray-400 italic text-center py-4">No templates yet.</div>}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
                         <input 
                            type="text" 
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            placeholder={editingStrategy ? "Update Name..." : "New Template Name..."}
                            className="flex-1 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-gray-300 outline-none dark:text-white"
                         />
                         <button 
                            onClick={handleSaveStrategy}
                            disabled={!orders.length || !strategyName || isSavingStrat}
                            className={clsx(
                                "text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                editingStrategy ? "bg-primary hover:bg-primary-dark" : "bg-gray-800 dark:bg-zinc-700 hover:bg-gray-700"
                            )}
                        >
                            {isSavingStrat ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />}
                        </button>
                     </div>
                </div>
            </div>

            {/* Right: Checklist & Visualization */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                
                {/* 1. Checklist Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col h-[400px]">
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/30 dark:bg-zinc-800/20 rounded-t-3xl">
                        <div>
                            <h2 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wide">
                                {editingStrategy ? `Editing: ${editingStrategy.name}` : 'Today\'s Plan'}
                            </h2>
                            {!editingStrategy && <div className="text-xs text-gray-400 mt-0.5">{new Date().toLocaleDateString()}</div>}
                        </div>
                        <div className="text-xs font-mono text-gray-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-gray-100 dark:border-zinc-700">
                            {orders.filter(o => o.filled).length} / {orders.length} Done
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {orders.map(order => (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={clsx(
                                        "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                                        order.filled 
                                            ? "bg-primary/10 border-primary/30" 
                                            : "bg-white dark:bg-zinc-800/30 border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm"
                                    )}
                                >
                                    <button 
                                        onClick={() => handleToggleFill(order.id)}
                                        className={clsx(
                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                            order.filled 
                                                ? "bg-primary border-primary text-white" 
                                                : "bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 hover:border-primary"
                                        )}
                                    >
                                        {order.filled && <Check size={14} strokeWidth={3} />}
                                    </button>
                                    
                                    {order.time && (
                                        <div className="text-xs font-mono font-medium text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                            {order.time}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className={clsx("font-medium text-sm truncate transition-colors", order.filled ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200")}>
                                            {order.name}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-2 text-[10px] font-mono text-gray-400">
                                            <span className={order.impact >= 0 ? "text-primary" : "text-danger"}>
                                                {order.impact > 0 ? '+' : ''}{order.impact}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveOrder(order.id)}
                                            className="text-gray-300 hover:text-danger p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {orders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-zinc-600">
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-full mb-3">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-sm font-medium">Your day is a blank canvas.</p>
                                <p className="text-xs mt-1">Add tasks or load a template.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Visualizer & Commit */}
                {!editingStrategy && (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Projected End State</div>
                                <div className={clsx("text-4xl font-light tracking-tighter", percentageChange >= 0 ? "text-primary" : "text-danger")}>
                                    {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                                {percentageChange >= 0 ? <TrendingUp size={14} className="text-primary" /> : <TrendingDown size={14} className="text-danger" />}
                                24h Timeline
                            </div>
                        </div>

                        <div className="h-[350px] w-full relative bg-gray-50 dark:bg-zinc-900 rounded-2xl mb-8 overflow-hidden border border-gray-100 dark:border-zinc-800">
                            {/* Uses reusable Chart component now */}
                            <Chart data={chartData} percentageMode={true} hideControls={true} />
                        </div>

                        {/* Commit Section */}
                        <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex-1 w-full space-y-3">
                                    <div className="flex gap-6 text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={clsx("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", commitMode === 'new' ? "border-primary" : "border-gray-300 dark:border-zinc-600")}>
                                                {commitMode === 'new' && <div className="w-2 h-2 bg-primary rounded-full" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="commitMode" 
                                                checked={commitMode === 'new'} 
                                                onChange={() => setCommitMode('new')}
                                                className="hidden"
                                            />
                                            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">New Session</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={clsx("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", commitMode === 'merge' ? "border-primary" : "border-gray-300 dark:border-zinc-600")}>
                                                {commitMode === 'merge' && <div className="w-2 h-2 bg-primary rounded-full" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="commitMode" 
                                                checked={commitMode === 'merge'} 
                                                onChange={() => setCommitMode('merge')}
                                                className="hidden"
                                            />
                                            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">Add to Existing</span>
                                        </label>
                                    </div>

                                    {commitMode === 'new' ? (
                                        <input 
                                            type="text" 
                                            value={newSessionName}
                                            onChange={(e) => setNewSessionName(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors dark:text-white"
                                        />
                                    ) : (
                                        <select 
                                            value={targetSessionId}
                                            onChange={(e) => setTargetSessionId(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors dark:text-white appearance-none"
                                        >
                                            <option value="">Select Session to Append...</option>
                                            {existingSessions.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} • {new Date(s.created_at).toLocaleDateString()}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <button 
                                    onClick={handleCommitSession}
                                    disabled={isCommitting || orders.filter(o => o.filled).length === 0 || (commitMode === 'merge' && !targetSessionId)}
                                    className="h-12 px-8 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full md:w-auto whitespace-nowrap"
                                >
                                    {isCommitting ? <Loader2 className="animate-spin" /> : <FolderPlus size={18} />}
                                    {isCommitting ? 'Saving...' : 'Commit to Log'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
