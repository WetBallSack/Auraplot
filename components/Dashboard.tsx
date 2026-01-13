
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { Plus, History, LogOut, TrendingUp, Crown, Lock, Calendar, Trash2, AlertCircle, Settings, Zap, Activity, Loader2, List, CheckSquare } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { SavedSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { OnboardingTour } from './OnboardingTour';
import { OrderBook } from './OrderBook';
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
  const [activeTab, setActiveTab] = useState<'history' | 'orderbook'>('history');
  
  const firstName = user?.name.split(' ')[0] || 'Traveler';
  const isPro = user?.isPro || false;

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
      className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex flex-col transition-colors duration-300"
    >
      {/* Onboarding Tour */}
      {user && !user.hasSeenOnboarding && <OnboardingTour />}

      {/* Navbar */}
      <div className="w-full px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 text-accent dark:text-white">
            <Logo className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">Aura</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block mr-2">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{t('dashboard.identity')}</div>
                <div className="text-sm font-medium text-primary flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    {user?.name}
                </div>
            </div>
            
            {!isPro ? (
                <button 
                    onClick={onUpgrade}
                    className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full text-xs font-bold border border-yellow-400/30 hover:bg-yellow-400/30 transition-colors"
                >
                    <Crown size={12} />
                    {t('dashboard.get_pro')}
                </button>
            ) : (
                <div className="hidden sm:flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold border border-primary/20">
                    <Crown size={12} /> {t('dashboard.pro_active')}
                </div>
            )}
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
            
            <LanguageToggle />
            <ThemeToggle />

            <button
                id="tour-settings"
                onClick={onSettings}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="Account Settings"
            >
                <Settings size={20} />
            </button>

            <button 
                onClick={logout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-danger transition-colors"
                title="Log Out"
            >
                <LogOut size={20} />
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 pb-32">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-light text-accent dark:text-white mb-2">{t('dashboard.welcome')}, {firstName}.</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.metrics_stable')}</p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('history')}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'history' 
                            ? "bg-white dark:bg-gray-700 text-accent dark:text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <List size={16} /> History
                </button>
                <button
                    id="tour-checklist-tab"
                    onClick={() => setActiveTab('orderbook')}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                        activeTab === 'orderbook' 
                            ? "bg-white dark:bg-gray-700 text-accent dark:text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <CheckSquare size={16} /> Live Checklist
                </button>
            </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
            
            {/* 1. HISTORY VIEW */}
            {activeTab === 'history' && (
                <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* New Session Card */}
                        <motion.div 
                            id="tour-start-session"
                            whileHover={{ y: -5 }}
                            onClick={onStartSession}
                            className="col-span-1 md:col-span-2 bg-accent dark:bg-primary/90 text-white p-8 rounded-3xl shadow-xl cursor-pointer relative overflow-hidden group border border-transparent dark:border-primary/20"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary dark:bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium mb-4 backdrop-blur-sm">
                                        <Plus size={12} /> {t('dashboard.new_entry')}
                                    </div>
                                    <h2 className="text-3xl font-semibold mb-2">{t('dashboard.init_session')}</h2>
                                    <p className="text-gray-300 dark:text-gray-100 max-w-md text-sm leading-relaxed">
                                        {t('dashboard.log_events')}
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 font-mono text-primary dark:text-white group-hover:translate-x-2 transition-transform">
                                    {t('dashboard.start_sequence')} &rarr;
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Card */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-colors relative overflow-hidden">
                            {isPro && stats ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-primary rounded-lg">
                                            <Activity size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-300">Lifetime Stats</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div>
                                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Sessions</div>
                                            <div className="text-xl font-mono font-bold text-gray-800 dark:text-white">{stats.totalSessions}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Events</div>
                                            <div className="text-xl font-mono font-bold text-gray-800 dark:text-white">{stats.totalEvents}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Avg Int</div>
                                            <div className="text-xl font-mono font-bold text-gray-800 dark:text-white flex items-center gap-1">
                                                {stats.avgIntensity} <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Max Impact</div>
                                            <div className="text-xl font-mono font-bold text-primary">+{stats.maxImpact}</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="w-full text-xs flex items-center justify-center gap-1 py-1 rounded-lg text-primary cursor-default opacity-70">
                                            {t('dashboard.advanced_active')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-50 dark:bg-gray-700 text-primary rounded-xl">
                                                <TrendingUp size={24} />
                                            </div>
                                            <span className="text-2xl font-mono font-bold text-accent dark:text-white">
                                                {sessions.length > 0 ? sessions.length : '--'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('dashboard.total_sessions')}</h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('dashboard.recorded_logs')}</p>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <button onClick={onUpgrade} className="w-full text-xs flex items-center justify-center gap-1 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            {t('dashboard.unlock_stats')} <Crown size={12}/>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative" id="tour-history">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 uppercase text-xs font-bold tracking-widest">
                                <History size={14} /> {t('dashboard.recent_sessions')}
                            </div>
                        </div>
                        
                        {loadingHistory ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        ) : fetchError ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
                                <div className="p-4 text-red-400 mb-2">
                                    <AlertCircle size={24} />
                                </div>
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{fetchError}</p>
                                <p className="text-xs text-red-400 dark:text-red-500 mt-1">Check your Supabase connection.</p>
                            </div>
                        ) : (
                            <div className="relative min-h-[300px]">
                                
                                {!isPro && sessions.length > 0 && (
                                    <div className="absolute -inset-4 z-20 flex flex-col items-center justify-center rounded-[2rem] overflow-hidden backdrop-blur-[6px] pointer-events-none">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/80 to-white dark:from-gray-900/30 dark:via-gray-900/90 dark:to-gray-900"></div>
                                        
                                        <div className="relative z-30 w-full px-8 flex flex-col items-center animate-in fade-in zoom-in duration-500 pointer-events-auto">
                                            <div className="w-full max-w-lg flex items-center gap-6 mb-6 opacity-90">
                                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-400 to-gray-400 dark:via-gray-600 dark:to-gray-600 flex-1 rounded-full"></div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Lock size={16} />
                                                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                                                        {t('dashboard.history_locked')}
                                                    </span>
                                                </div>
                                                <div className="h-[2px] bg-gradient-to-l from-transparent via-gray-400 to-gray-400 dark:via-gray-600 dark:to-gray-600 flex-1 rounded-full"></div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 text-center max-w-md font-medium leading-relaxed drop-shadow-sm">
                                                {t('dashboard.upgrade_history')}
                                            </p>
                                            <button 
                                                onClick={onUpgrade}
                                                className="group relative bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(0,200,150,0.3)] hover:shadow-[0_4px_25px_rgba(0,200,150,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
                                            >
                                                <Crown size={16} className="group-hover:rotate-12 transition-transform" /> 
                                                {t('dashboard.get_pro')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full mb-4 text-gray-400">
                                            <History size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.no_sessions')}</p>
                                        <button 
                                            onClick={onStartSession}
                                            className="mt-4 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                                        >
                                            {t('dashboard.start_first')} &rarr;
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-500">
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
                                                        "p-5 rounded-2xl border hover:shadow-md transition-all group relative overflow-hidden",
                                                        isPro ? "cursor-pointer" : "cursor-default opacity-80", 
                                                        !isPro && "grayscale-[0.3]",
                                                        !isPro && isPositive ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30" : 
                                                        !isPro && !isPositive ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30" :
                                                        "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2 max-w-[200px]">
                                                                {session.name || t('dashboard.untitled')}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                <Calendar size={12} />
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
                                                                        className="relative z-50 p-1.5 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-1 text-[10px] font-bold pointer-events-auto"
                                                                        title="Confirm Delete"
                                                                    >
                                                                        <Trash2 size={12} /> Confirm
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
                                                                        className="relative z-50 p-1.5 text-gray-300 hover:text-danger dark:text-gray-600 dark:hover:text-danger rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto"
                                                                        title="Delete Memory"
                                                                    >
                                                                        {isDeletingThis ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                                    </motion.button>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-4 relative z-10">
                                                        <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
                                                            {session.events?.length || 0} {t('dashboard.events')}
                                                        </div>
                                                        <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
                                                            {t('dashboard.base')}: {session.initial_score}
                                                        </div>
                                                    </div>

                                                    {!isPro && (
                                                        <div className={clsx(
                                                            "absolute top-0 right-0 w-20 h-20 blur-[40px] opacity-20",
                                                            isPositive ? "bg-green-500" : "bg-red-500"
                                                        )}></div>
                                                    )}
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

        </AnimatePresence>
      </div>
    </motion.div>
  );
};
