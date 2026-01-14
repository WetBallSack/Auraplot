
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Trash2, Check, TrendingUp, TrendingDown, Copy, Loader2, Info, Lock, Crown, Clock } from 'lucide-react';
import { ScheduledOrder, Strategy } from '../types';
import { api } from '../services/api';
import clsx from 'clsx';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Planner: React.FC = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthlyOrders, setMonthlyOrders] = useState<ScheduledOrder[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Side Panel State
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [dailyOrders, setDailyOrders] = useState<ScheduledOrder[]>([]);
    const [panelLoading, setPanelLoading] = useState(false);

    // Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemImpact, setNewItemImpact] = useState(5);
    const [newItemIntensity, setNewItemIntensity] = useState(5);
    const [newItemStickiness, setNewItemStickiness] = useState(0.5);
    const [newItemTime, setNewItemTime] = useState('');

    // Strategy Deploy State
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [showStratMenu, setShowStratMenu] = useState(false);

    useEffect(() => {
        fetchMonthlyData();
        loadStrategies();
    }, [currentDate]);

    useEffect(() => {
        if (selectedDateStr) {
            // Filter locally first for speed
            const dateOrders = monthlyOrders.filter(o => o.scheduled_date === selectedDateStr);
            setDailyOrders(dateOrders);
        }
    }, [selectedDateStr, monthlyOrders]);

    const loadStrategies = async () => {
        const strats = await api.getStrategies();
        setStrategies(strats);
    };

    const fetchMonthlyData = async () => {
        setLoading(true);
        // Get start and end of month
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0);
        
        // Add buffer days for grid (optional, but API takes simple ISO dates)
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        try {
            const data = await api.getScheduledOrdersByRange(startStr, endStr);
            setMonthlyOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Grid Logic ---
    const getDaysInMonth = () => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const firstDay = new Date(y, m, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        
        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) days.push(null);
        // Days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(y, m, i));
        
        return days;
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const handleDayClick = (date: Date) => {
        // Adjust for timezone offset to get YYYY-MM-DD correct
        const offset = date.getTimezoneOffset();
        const correctedDate = new Date(date.getTime() - (offset * 60 * 1000));
        setSelectedDateStr(correctedDate.toISOString().split('T')[0]);
        // Reset form
        setNewItemName('');
        setNewItemImpact(5);
        setNewItemIntensity(5);
        setNewItemStickiness(0.5);
        setNewItemTime('');
    };

    // --- Panel Actions ---
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDateStr || !newItemName) return;

        // Pro Limit Check
        if (!user?.isPro && dailyOrders.length >= 7) {
            alert(t('planner.free_limit_alert'));
            return;
        }

        try {
            const newOrder = await api.saveScheduledOrder({
                name: newItemName,
                impact: newItemImpact,
                intensity: newItemIntensity,
                stickiness: newItemStickiness,
                time: newItemTime || undefined,
                scheduled_date: selectedDateStr,
                filled: false
            });
            
            setMonthlyOrders(prev => [...prev, newOrder]);
            setNewItemName('');
            setNewItemTime('');
            setNewItemImpact(5);
            setNewItemIntensity(5);
            setNewItemStickiness(0.5);
        } catch (e) {
            alert(t('planner.failed_add'));
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            await api.deleteScheduledOrder(id);
            setMonthlyOrders(prev => prev.filter(o => o.id !== id));
        } catch (e) {
            alert(t('planner.failed_delete'));
        }
    };

    const handleDeployStrategy = async (strat: Strategy) => {
        if (!selectedDateStr) return;
        
        // Pro Limit Check for Batch
        if (!user?.isPro && (dailyOrders.length + strat.orders.length > 7)) {
             alert(t('planner.batch_limit_alert'));
             return;
        }

        setPanelLoading(true);
        try {
            await api.deployStrategyToDate(strat, selectedDateStr);
            // Refresh full month to be safe
            await fetchMonthlyData();
            setShowStratMenu(false);
        } catch (e) {
            alert(t('planner.failed_deploy'));
        } finally {
            setPanelLoading(false);
        }
    };

    // --- Render Helpers ---
    const getDayMetrics = (dateStr: string) => {
        const orders = monthlyOrders.filter(o => o.scheduled_date === dateStr);
        if (orders.length === 0) return null;
        const netImpact = orders.reduce((acc, o) => acc + o.impact, 0);
        return { count: orders.length, netImpact };
    };

    const daysShort = t('planner.days_short') as unknown as string[];

    return (
        <div className="w-full flex flex-col md:flex-row gap-8 h-auto md:h-[600px]">
            {/* Calendar Grid */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
                        {currentDate.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {daysShort.map((d, i) => (
                        <div key={d} className={clsx("text-xs font-bold uppercase py-2", (i === 0 || i === 6) ? "text-red-400" : "text-gray-400")}>{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
                    {getDaysInMonth().map((day, idx) => {
                        if (!day) return <div key={idx} className="bg-transparent"></div>;
                        
                        // Format date string for lookup
                        const offset = day.getTimezoneOffset();
                        const corrected = new Date(day.getTime() - (offset * 60 * 1000));
                        const dateStr = corrected.toISOString().split('T')[0];
                        
                        const metrics = getDayMetrics(dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const isSelected = selectedDateStr === dateStr;
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                            <div 
                                key={idx} 
                                onClick={() => handleDayClick(day)}
                                className={clsx(
                                    "rounded-xl border p-2 relative cursor-pointer transition-all hover:border-primary/50 flex flex-col justify-between group h-full min-h-[50px]",
                                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : 
                                    isToday ? "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" :
                                    isWeekend ? "bg-gray-50/50 dark:bg-zinc-900/30 border-gray-100 dark:border-zinc-800/50" :
                                    "bg-white dark:bg-zinc-900/50 border-gray-100 dark:border-zinc-800"
                                )}
                            >
                                <span className={clsx("text-xs font-bold", isToday ? "text-primary" : isWeekend ? "text-red-400/70" : "text-gray-500")}>
                                    {day.getDate()}
                                </span>
                                
                                {metrics && (
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="flex gap-0.5">
                                            {Array.from({length: Math.min(3, metrics.count)}).map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
                                            ))}
                                        </div>
                                        {/* Mini Candle Indicator */}
                                        <div className={clsx(
                                            "w-1.5 h-3 rounded-sm",
                                            metrics.netImpact >= 0 ? "bg-primary" : "bg-danger"
                                        )} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Side Panel */}
            <AnimatePresence mode="wait">
                {selectedDateStr ? (
                    <motion.div 
                        key="panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full md:w-[320px] bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <CalendarIcon size={16} /> 
                                {new Date(selectedDateStr).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                            </h3>
                            <button onClick={() => setSelectedDateStr(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-1 custom-scrollbar min-h-[150px]">
                            {dailyOrders.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-xs italic">
                                    {t('planner.no_orders')}
                                </div>
                            ) : (
                                dailyOrders.sort((a,b) => (a.time || '99:99').localeCompare(b.time || '99:99')).map(o => (
                                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                                        <div>
                                            <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{o.name}</div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                {o.time && (
                                                    <span className="font-mono bg-gray-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <Clock size={8} /> {o.time}
                                                    </span>
                                                )}
                                                <span className={o.impact >= 0 ? "text-primary" : "text-danger"}>{o.impact > 0 ? '+' : ''}{o.impact}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteItem(o.id)} className="text-gray-300 hover:text-danger">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Free Limit Notice */}
                        {!user?.isPro && (
                            <div className="mb-4 text-xs flex justify-between items-center bg-gray-50 dark:bg-zinc-800 px-3 py-2 rounded-lg">
                                <span className="text-gray-500">{t('planner.slots_used')}</span>
                                <span className={clsx("font-mono font-bold", dailyOrders.length >= 7 ? "text-danger" : "text-gray-700 dark:text-white")}>
                                    {dailyOrders.length}/7
                                </span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-4">
                            {/* Strategy Deploy */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowStratMenu(!showStratMenu)}
                                    className="w-full py-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {panelLoading ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                                    {t('planner.deploy_strategy')}
                                </button>
                                
                                <AnimatePresence>
                                    {showStratMenu && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto z-50"
                                        >
                                            <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">{t('planner.select_template')}</div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-2 mb-2 rounded-lg text-[10px] text-blue-600 dark:text-blue-300 leading-tight">
                                                {t('planner.template_hint')}
                                            </div>
                                            {strategies.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => handleDeployStrategy(s)}
                                                    className="w-full text-left px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg truncate"
                                                >
                                                    {s.name}
                                                </button>
                                            ))}
                                            {strategies.length === 0 && <div className="px-2 py-2 text-xs text-gray-400">{t('planner.no_templates')}</div>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Add Item Form */}
                            <form onSubmit={handleAddItem} className="bg-gray-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                                <input 
                                    className="w-full bg-transparent border-b border-gray-200 dark:border-zinc-700 text-sm py-1 outline-none mb-3 dark:text-white"
                                    placeholder={t('planner.task_name')}
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-[10px] font-medium">
                                        <span className={newItemImpact < 0 ? "text-danger" : "text-gray-400"}>{t('planner.drain')}</span>
                                        <span className="font-mono font-bold text-gray-800 dark:text-white">{newItemImpact > 0 ? '+' : ''}{newItemImpact}</span>
                                        <span className={newItemImpact > 0 ? "text-primary" : "text-gray-400"}>{t('planner.boost')}</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="-10" max="10" step="1"
                                        value={newItemImpact}
                                        onChange={(e) => setNewItemImpact(Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">{t('planner.intensity')} {newItemIntensity}</label>
                                        <input 
                                            type="range"
                                            min="1" max="10"
                                            value={newItemIntensity}
                                            onChange={(e) => setNewItemIntensity(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">{t('planner.stickiness')} {newItemStickiness}</label>
                                        <input 
                                            type="range"
                                            min="0" max="1" step="0.1"
                                            value={newItemStickiness}
                                            onChange={(e) => setNewItemStickiness(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-between mb-1">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {t('planner.time')}</span>
                                        <span className="text-[8px] text-primary">{t('planner.timezone_hint')}: {user?.timezone?.split('/')[1] || 'Local'}</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="time" 
                                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs outline-none text-gray-700 dark:text-gray-300 focus:border-primary transition-colors"
                                            value={newItemTime}
                                            onChange={e => setNewItemTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={!newItemName || (!user?.isPro && dailyOrders.length >= 7)} 
                                    className="w-full bg-primary text-white py-2 rounded-lg text-xs font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {!user?.isPro && dailyOrders.length >= 7 ? (
                                        <><Lock size={12} /> {t('planner.limit_reached')}</>
                                    ) : (
                                        `${t('planner.add_to_date')} ${new Date(selectedDateStr).getDate()}`
                                    )}
                                </button>
                            </form>
                            
                            <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-tight pt-1">
                                <Info size={12} className="shrink-0 mt-0.5" />
                                {t('planner.hint')}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="w-full md:w-[320px] bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-gray-400 p-6"
                    >
                        <CalendarIcon size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium text-center">{t('planner.select_date')}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
