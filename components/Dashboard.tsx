
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { Plus, History, LogOut, TrendingUp, Crown, Lock, Calendar, Trash2, AlertCircle, Settings, Zap, Activity, Loader2, List, CheckSquare, Grid } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { SavedSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { OnboardingTour } from './OnboardingTour';
import { OrderBook } from './OrderBook';
import { Planner } from './Planner';
import clsx from 'clsx';

export const Dashboard: React.FC<{ 
    onStartSession: () => void, 
    onUpgrade: () => void,
    onEditSession: (session: SavedSession) => void,
    onSettings: () => void
}> = ({ onStartSession, onUpgrade, onEditSession, onSettings }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // State for deletion interaction
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // New Tab State
  const [activeTab, setActiveTab] = useState<'history' | 'orderbook' | 'planner'>('history');
  
  const firstName = user?.name.split(' ')[0] || 'Traveler';
  const isPro = user?.isPro || false;

  // Auto-sync timezone on mount to ensure backend crons have valid data
  useEffect(() => {
    const syncTimezone = async () => {
        if (!user) return;
        try {
            const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            // This ensures the database user_metadata.timezone is never null for active users
            await api.updateProfile({ timezone: browserTz });
        } catch (e) {
            console.error("Timezone auto-sync failed", e);
        }
    };
    syncTimezone();
  }, []);

  const fetchSessions = async () => {
    setLoadingHistory(true);
    setFetchError(null);
    try {
        const data = await api.getSessions();
        setSessions(data);
    } catch (e: any) {
        console.error("Failed to load history", e);
        setFetchError(e.message || "Failed to load history");
    } finally {
        setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // First click: Request confirmation
  const handleRequestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
        setConfirmDeleteId(null);
    } else {
        setConfirmDeleteId(id);
        setTimeout(() => {
            setConfirmDeleteId(prev => prev === id ? null : prev);
        }, 4000);
    }
  };

  // Second click: Execute delete
  const handleExecuteDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setDeletingId(id);
    
    try {
        await api.deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
        console.error("[Dashboard] Delete failed:", error);
        alert(`Failed to delete: ${error.message}`);
    } finally {
        setDeletingId(null);
    }
  };

  // Advanced Stats Calculation
  const stats = useMemo(() => {
    if (!sessions.length) return null;
    let totalEvents = 0;
    let totalIntensity = 0;
    let maxImpact = 0;
    let totalSessions = sessions.length;

    sessions.forEach(s => {
        if (s.events) {
            totalEvents += s.events.length;
            s.events.forEach(e => {
                totalIntensity += Number(e.intensity);
                if (Math.abs(e.impact) > maxImpact) maxImpact = Math.abs(e.impact);
            });
        }
    });

    const avgIntensity = totalEvents > 0 ? (totalIntensity / totalEvents).toFixed(1) : '0';

    return { totalSessions, totalEvents, avgIntensity, maxImpact };
  }, [sessions]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#F9FAFB] dark:bg-[#000000] flex flex-col transition-colors duration-500"
    >
      {/* Onboarding Tour */}
      {user && !user.hasSeenOnboarding && <OnboardingTour />}

      {/* Navbar - Minimalist */}
      <div className="w-full px-6 md:px-10 py-6 flex justify-between items-center sticky top-0 z-50 mix-blend-difference pointer-events-none text-white">
        <div className="flex items-center gap-3 pointer-events-auto">
            <Logo className="w-8 h-8 text-white" />
            <span className="font-bold text-lg tracking-tight hidden sm:inline">Aura</span>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
            
            {!isPro ? (
                <button 
                    onClick={onUpgrade}
                    className="hidden sm:flex items-center gap-1.5 bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
                >
                    <Crown size={12} />
                    {t('dashboard.get_pro')}
                </button>
            ) : (
                <div className="hidden sm:flex items-center gap-1 bg-[#00C896]/20 text-[#00C896] px-3 py-1.5 rounded-full text-xs font-bold border border-[#00C896]/30">
                    <Crown size={12} /> {t('dashboard.pro_active')}
                </div>
            )}
            
            <LanguageToggle className="!bg-white/10 !border-white/10 !text-white hover:!bg-white/20" />
            <ThemeToggle className="!bg-white/10 !border-white/10 !text-white hover:!bg-white/20" />

            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
                <button
                    id="tour-settings"
                    onClick={onSettings}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    title="Account Settings"
                >
                    <Settings size={20} />
                </button>

                <button 
                    onClick={logout}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-danger transition-colors"
                    title="Log Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10 pb-32 pt-4">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
                    {t('dashboard.welcome')}, {firstName}.
                </h1>
                <div className="flex items-center gap-3 mt-4">
                     <div className="h-px w-8 bg-[#00C896]"></div>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-mono uppercase tracking-widest">{t('dashboard.metrics_stable')}</p>
                </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-white dark:bg-[#1C1C1E] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <button
                    onClick={() => setActiveTab('history')}
                    className={clsx(
                        "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        activeTab === 'history' 
                            ? "bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" 
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <List size={14} /> History
                </button>
                <button
                    id="tour-checklist-tab"
                    onClick={() => setActiveTab('orderbook')}
                    className={clsx(
                        "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        activeTab === 'orderbook' 
                            ? "bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" 
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <CheckSquare size={14} /> Checklist
                </button>
                <button
                    onClick={() => setActiveTab('planner')}
                    className={clsx(
                        "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        activeTab === 'planner' 
                            ? "bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" 
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <Grid size={14} /> Planner
                </button>
            </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
            
            {/* 1. HISTORY VIEW */}
            {activeTab === 'history' && (
                <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* New Session Card */}
                        <motion.div 
                            id="tour-start-session"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={onStartSession}
                            className="col-span-1 md:col-span-2 bg-gradient-to-br from-gray-900 to-black dark:from-[#1C1C1E] dark:to-black p-10 rounded-[2.5rem] shadow-2xl cursor-pointer relative overflow-hidden group border border-gray-800 dark:border-white/5"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C896]/20 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 group-hover:bg-[#00C896]/30 transition-colors duration-700"></div>
                            
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-6 backdrop-blur-sm">
                                        <Plus size={10} /> {t('dashboard.new_entry')}
                                    </div>
                                    <h2 className="text-4xl font-light text-white mb-4 tracking-tight">{t('dashboard.init_session')}</h2>
                                    <p className="text-gray-400 max-w-md text-sm leading-relaxed font-light">
                                        {t('dashboard.log_events')}
                                    </p>
                                </div>
                                <div className="mt-12 flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-[#00C896] group-hover:translate-x-2 transition-transform">
                                    {t('dashboard.start_sequence')} <div className="w-8 h-px bg-[#00C896]"></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Card */}
                        <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between transition-colors relative overflow-hidden group">
                            {isPro && stats ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-gray-50 dark:bg-[#2C2C2E] text-[#00C896] rounded-xl border border-gray-100 dark:border-white/5">
                                            <Activity size={20} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Lifetime Stats</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-y-8 gap-x-4 flex-1">
                                        <div>
                                            <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Sessions</div>
                                            <div className="text-2xl font-light text-gray-900 dark:text-white">{stats.totalSessions}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Events</div>
                                            <div className="text-2xl font-light text-gray-900 dark:text-white">{stats.totalEvents}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Avg Int</div>
                                            <div className="text-2xl font-light text-gray-900 dark:text-white flex items-center gap-1">
                                                {stats.avgIntensity} <span className="text-yellow-500 text-xs">⚡</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Max Impact</div>
                                            <div className="text-2xl font-light text-[#00C896]">+{stats.maxImpact}</div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                        <div className="w-full text-[10px] font-bold uppercase tracking-widest text-center text-[#00C896] opacity-70">
                                            {t('dashboard.advanced_active')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] text-[#00C896] rounded-2xl border border-gray-100 dark:border-white/5">
                                                    <TrendingUp size={24} />
                                                </div>
                                                <span className="text-4xl font-light text-gray-900 dark:text-white">
                                                    {sessions.length > 0 ? sessions.length : '0'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{t('dashboard.total_sessions')}</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed">{t('dashboard.recorded_logs')}</p>
                                        </div>
                                        
                                        <div className="mt-8">
                                            <button onClick={onUpgrade} className="w-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5">
                                                {t('dashboard.unlock_stats')} <Crown size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative pt-8" id="tour-history">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <History size={16} className="text-[#00C896]" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white">
                                    {t('dashboard.recent_sessions')}
                                </h3>
                            </div>
                        </div>
                        
                        {loadingHistory ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full opacity-50"></div>
                            </div>
                        ) : fetchError ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30">
                                <AlertCircle size={32} className="text-red-400 mb-4" />
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{fetchError}</p>
                            </div>
                        ) : (
                            <div className="relative min-h-[300px]">
                                
                                {!isPro && sessions.length > 0 && (
                                    <div className="absolute inset-0 -mx-4 -my-4 z-20 flex flex-col items-center justify-center backdrop-blur-[8px] rounded-[2.5rem] border border-white/5 pointer-events-none bg-gradient-to-b from-white/10 via-white/80 to-white dark:from-black/10 dark:via-black/80 dark:to-black">
                                        <div className="relative z-30 flex flex-col items-center pointer-events-auto p-8 text-center animate-in fade-in zoom-in duration-700">
                                            <div className="flex items-center gap-3 mb-6 bg-black/80 dark:bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                                <Lock size={12} className="text-gray-300" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                                                    {t('dashboard.history_locked')}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-4">
                                                Unlock Your Past
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-sm">
                                                {t('dashboard.upgrade_history')}
                                            </p>
                                            <button 
                                                onClick={onUpgrade}
                                                className="group bg-[#00C896] hover:bg-[#00B084] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,200,150,0.3)] transition-all flex items-center gap-2 hover:scale-105"
                                            >
                                                <Crown size={14} /> 
                                                {t('dashboard.get_pro')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
                                        <div className="p-4 bg-gray-50 dark:bg-[#2C2C2E] rounded-full mb-6 text-gray-400">
                                            <History size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">{t('dashboard.no_sessions')}</p>
                                        <button 
                                            onClick={onStartSession}
                                            className="text-xs font-bold uppercase tracking-widest text-[#00C896] hover:text-white transition-colors"
                                        >
                                            {t('dashboard.start_first')} &rarr;
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sessions.map((session) => {
                                            const netImpact = session.events?.reduce((acc, e) => acc + (e.impact * (e.stickiness || 1)), 0) || 0;
                                            const isPositive = netImpact >= 0;
                                            const isDeletingThis = deletingId === session.id;
                                            const isConfirmingThis = confirmDeleteId === session.id;

                                            return (
                                                <motion.div
                                                    key={session.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: isDeletingThis ? 0.5 : 1, y: 0, scale: isDeletingThis ? 0.95 : 1 }}
                                                    onClick={() => !isDeletingThis && !isConfirmingThis && isPro && onEditSession(session)}
                                                    className={clsx(
                                                        "p-6 rounded-3xl border transition-all group relative overflow-hidden h-[180px] flex flex-col justify-between",
                                                        isPro ? "cursor-pointer hover:border-[#00C896]/30 hover:shadow-lg dark:hover:bg-[#2C2C2E]" : "cursor-default opacity-80 grayscale-[0.5]", 
                                                        "bg-white dark:bg-[#1C1C1E] border-gray-100 dark:border-white/5"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start relative z-10">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white truncate pr-2 max-w-[160px]">
                                                                {session.name || t('dashboard.untitled')}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 mt-1.5 uppercase tracking-wide">
                                                                {new Date(session.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <AnimatePresence mode="wait">
                                                                {isConfirmingThis ? (
                                                                    <motion.button
                                                                        key="confirm"
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                                        onClick={(e) => handleExecuteDelete(e, session.id)}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                        className="relative z-50 p-2 bg-red-500 text-white rounded-lg shadow-lg text-[10px] font-bold pointer-events-auto uppercase tracking-widest"
                                                                    >
                                                                        Confirm
                                                                    </motion.button>
                                                                ) : (
                                                                    <motion.button 
                                                                        key="delete"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        onClick={(e) => handleRequestDelete(e, session.id)}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                        disabled={isDeletingThis}
                                                                        className="relative z-50 p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto"
                                                                    >
                                                                        {isDeletingThis ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                                    </motion.button>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                    <div className="relative z-10 pt-4 border-t border-gray-100 dark:border-white/5 mt-auto flex justify-between items-end">
                                                        <div>
                                                            <div className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Base</div>
                                                            <div className="font-mono text-sm text-gray-600 dark:text-gray-300">{session.initial_score}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Events</div>
                                                            <div className="font-mono text-sm text-gray-600 dark:text-gray-300">{session.events?.length || 0}</div>
                                                        </div>
                                                    </div>

                                                    {/* Subtle Glow */}
                                                    <div className={clsx(
                                                        "absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-20 transition-colors duration-500 pointer-events-none",
                                                        isPositive ? "bg-[#00C896]" : "bg-red-500"
                                                    )}></div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* 2. ORDER BOOK VIEW */}
            {activeTab === 'orderbook' && (
                 <motion.div
                    key="orderbook"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                 >
                     <OrderBook existingSessions={sessions} onRefreshHistory={fetchSessions} />
                 </motion.div>
            )}

             {/* 3. PLANNER VIEW */}
             {activeTab === 'planner' && (
                 <motion.div
                    key="planner"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                 >
                     <Planner />
                 </motion.div>
            )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};
