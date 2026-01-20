
import React, { useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { Crown, TrendingUp, Activity, BarChart2, Shield, ArrowUpRight, ArrowDownRight, CheckSquare, Calendar, Bell, Terminal, ArrowRight, Zap, Loader2, Check, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

// --- ANIMATION WRAPPER ---
const FadeInSection = ({ children, delay = 0 }: { children?: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay, ease: [0.2, 0.65, 0.3, 0.9] }}
    >
        {children}
    </motion.div>
);

// --- SUB-COMPONENTS ---

const ComparisonSection = ({ t }: { t: any }) => {
    const rows = [
        { label: "Data Structure", old: t('landing.comp_text'), apps: t('landing.comp_binary'), aura: t('landing.comp_ohlc') },
        { label: "Recall Method", old: t('landing.comp_subjective'), apps: t('landing.comp_isolated'), aura: t('landing.comp_correlated') },
        { label: "Mechanism", old: t('landing.comp_passive'), apps: t('landing.comp_gamified'), aura: t('landing.comp_predictive') },
    ];

    return (
        <section className="relative z-10 py-40 px-6 bg-white dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors">
            <div className="max-w-6xl mx-auto">
                <FadeInSection>
                    <div className="mb-24 md:text-center">
                         <h2 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-6">
                            {t('landing.compare_title')}
                         </h2>
                         <p className="text-gray-500 font-light text-lg max-w-2xl md:mx-auto">{t('landing.compare_desc')}</p>
                    </div>
                </FadeInSection>

                <FadeInSection delay={0.2}>
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="min-w-[800px]">
                            {/* Header */}
                            <div className="grid grid-cols-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Metric</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('landing.comp_old')}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('landing.comp_apps')}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                    {t('landing.comp_aura')}
                                </div>
                            </div>

                            {/* Rows */}
                            {rows.map((row, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="grid grid-cols-4 py-6 border-b border-gray-100 dark:border-gray-900 last:border-0 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-4 -mx-4 rounded-xl items-center relative overflow-hidden"
                                >
                                    <div className="font-mono text-xs text-gray-400 uppercase tracking-wider relative z-10">{row.label}</div>
                                    <div className="text-sm text-gray-500 font-serif italic opacity-70 relative z-10">{row.old}</div>
                                    <div className="text-sm text-gray-500 relative z-10">{row.apps}</div>
                                    <div className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-3 relative z-10">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,200,150,0.6)]"></div>
                                        {row.aura}
                                    </div>
                                    
                                    {/* Subtle green highlight for the Aura column row-by-row */}
                                    <div className="absolute top-0 bottom-0 right-0 w-[25%] bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </FadeInSection>
            </div>
        </section>
    );
};

const InteractiveSimulator = ({ onInitialize }: { onInitialize: () => void }) => {
    const { t } = useLanguage();
    const [intensity, setIntensity] = useState(5);
    const [isBullish, setIsBullish] = useState(true);
    const [eventName, setEventName] = useState("");

    return (
        <div className="w-full max-w-3xl bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 p-8 md:p-12 rounded-[2px] relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>

            <div className="flex justify-between items-end mb-16 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-2">Simulation Mode // 001</span>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">{t('landing.simulator_title')}</h3>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(0,200,150,0.8)]"></span> Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Inputs */}
                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Input Event</label>
                        <input 
                            type="text" 
                            placeholder={t('landing.sim_placeholder')}
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-base focus:border-primary outline-none transition-colors dark:text-white placeholder:text-gray-400/50 font-light rounded-none"
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('landing.sim_intensity')}</label>
                                <span className="font-mono text-xs text-primary">{intensity.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="0.1"
                            value={intensity}
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-[1px] bg-gray-300 dark:bg-gray-700 appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
                        <motion.button 
                            whileHover={{ backgroundColor: isBullish ? undefined : "rgba(0,0,0,0.02)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsBullish(true)}
                            className={clsx("py-4 text-[10px] font-bold uppercase tracking-widest transition-colors", 
                                isBullish ? "bg-white dark:bg-black text-primary shadow-inner" : "bg-gray-50 dark:bg-[#0A0A0A] text-gray-400 hover:text-gray-600")}
                        >
                            {t('landing.sim_bullish')}
                        </motion.button>
                        <motion.button 
                                whileHover={{ backgroundColor: !isBullish ? undefined : "rgba(0,0,0,0.02)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsBullish(false)}
                                className={clsx("py-4 text-[10px] font-bold uppercase tracking-widest transition-colors", 
                                !isBullish ? "bg-white dark:bg-black text-danger shadow-inner" : "bg-gray-50 dark:bg-[#0A0A0A] text-gray-400 hover:text-gray-600")}
                        >
                            {t('landing.sim_bearish')}
                        </motion.button>
                    </div>
                </div>

                {/* Output Visualization */}
                <div className="relative h-64 border-l border-gray-200 dark:border-gray-800 pl-8 md:pl-16 flex items-center justify-center">
                    <div className="absolute inset-y-0 left-8 md:left-16 right-0 border-t border-dashed border-gray-200 dark:border-gray-800 top-1/2"></div>
                    
                    {/* Minimalist Candle */}
                    <div className="relative w-12 flex flex-col items-center justify-center h-full">
                        {isBullish ? (
                            <>
                                <motion.div 
                                    className="w-[1px] bg-gray-400 dark:bg-gray-600 absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom"
                                    initial={{ height: 0 }}
                                    animate={{ height: intensity * 12 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                />
                                <motion.div 
                                    className="w-full bg-primary absolute bottom-1/2 shadow-[0_0_20px_rgba(0,200,150,0.4)]"
                                    initial={{ height: 0 }}
                                    animate={{ height: intensity * 8 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                />
                            </>
                        ) : (
                            <>
                                <motion.div 
                                    className="w-[1px] bg-gray-400 dark:bg-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 origin-top"
                                    initial={{ height: 0 }}
                                    animate={{ height: intensity * 12 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                />
                                <motion.div 
                                    className="w-full bg-danger absolute top-1/2 shadow-[0_0_20px_rgba(255,95,95,0.4)]"
                                    initial={{ height: 0 }}
                                    animate={{ height: intensity * 8 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                />
                            </>
                        )}
                    </div>
                    
                    <div className="absolute top-0 right-0 font-mono text-[10px] text-gray-400">
                        {isBullish ? '+' : '-'}{(intensity * 1.25).toFixed(2)}%
                    </div>
                </div>
            </div>
            
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onInitialize}
                className="mt-12 w-full py-4 border border-gray-900 dark:border-white text-gray-900 dark:text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
                Execute
            </motion.button>
        </div>
    );
};

const FeatureRow = ({ icon: Icon, title, desc, index }: { icon: any, title: string, desc: string, index: number }) => (
    <div className="group flex flex-col py-12 border-t border-gray-200 dark:border-gray-800 transition-all hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/5 px-6 -mx-6 rounded-2xl">
        <div className="flex items-start justify-between mb-6">
            <span className="font-mono text-xs text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">0{index + 1}</span>
            <Icon size={24} className="text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-3 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
            {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-xs group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {desc}
        </p>
    </div>
);

// Hero - Refined Logo & Text
const Hero = ({ t, onEnter, isInitializing }: { t: any, onEnter: () => void, isInitializing: boolean }) => {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-20 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center z-20 flex flex-col items-center"
            >
                {/* ROTATING LOGO - Smaller Size */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    className="mb-12 relative"
                >
                    <Logo className="w-24 h-24 md:w-32 md:h-32 text-primary opacity-90 stroke-[0.8]" />
                    {/* Enhanced Glow */}
                    <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full pointer-events-none animate-pulse"></div>
                </motion.div>
                
                <h1 className="text-[10vw] md:text-[8rem] font-thin tracking-tighter text-gray-900 dark:text-white leading-[0.8] mb-12 select-none drop-shadow-sm">
                    Aura
                </h1>
                
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-12 opacity-50"></div>

                <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-16 text-center">
                    {t('landing.subtitle')}
                </p>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnter}
                    disabled={isInitializing}
                    className="group relative inline-flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white hover:text-primary transition-colors disabled:opacity-50"
                >
                    {isInitializing ? (
                        <>
                            <Loader2 className="animate-spin" size={14} /> 
                            Initializing System...
                        </>
                    ) : (
                        <>
                            <span className="border-b border-transparent group-hover:border-primary transition-all pb-1">{t('landing.initialize')}</span> 
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>
            </motion.div>
        </section>
    );
};

// --- MAIN COMPONENT ---

export const Landing: React.FC<{ onEnter: () => void, onPricing: () => void, onTerms: () => void, onFAQ: () => void }> = ({ onEnter, onPricing, onTerms, onFAQ }) => {
  const { t } = useLanguage();
  const [initializing, setInitializing] = useState(false);

  const handleInitialize = () => {
      setInitializing(true);
      setTimeout(() => {
          onEnter();
      }, 800);
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-700 font-sans selection:bg-primary/20 selection:text-primary relative overflow-x-hidden"
    >
        {/* Global Ambient Green Glow */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50 dark:opacity-30"></div>

        {/* Sticky Nav - Minimal */}
        <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
            <div className="pointer-events-auto opacity-0 md:opacity-100 transition-opacity">
            </div>
            <div className="flex items-center gap-8 pointer-events-auto">
                <button 
                    onClick={onPricing} 
                    className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
                >
                    {t('landing.pricing')}
                </button>
                <div className="flex items-center gap-4">
                    <LanguageToggle className="!bg-transparent !text-white !p-0 hover:!opacity-70 !w-auto !h-auto" />
                    <ThemeToggle className="!bg-transparent !text-white !p-0 hover:!opacity-70" />
                </div>
            </div>
        </nav>

        {/* 1. Hero Section */}
        <Hero t={t} onEnter={handleInitialize} isInitializing={initializing} />

        {/* 2. The Problem (Pain Killer) - Architectural Text */}
        <section className="relative z-10 py-40 px-6 bg-gray-50 dark:bg-[#080808]">
            <div className="max-w-5xl mx-auto">
                <FadeInSection>
                    <div className="flex flex-col md:flex-row gap-16 items-start">
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-8">
                                {t('landing.pain_killer_title')}
                            </h2>
                            <div className="w-12 h-px bg-primary shadow-[0_0_10px_rgba(0,200,150,0.5)]"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                                {t('landing.pain_killer_desc')}
                            </p>
                        </div>
                    </div>
                </FadeInSection>
            </div>
        </section>

        {/* 3. Simulator Demo - Instrument Style */}
        <section className="relative z-10 py-40 px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
                <div className="flex-1 order-2 lg:order-1">
                    <FadeInSection delay={0.2}>
                        <InteractiveSimulator onInitialize={handleInitialize} />
                    </FadeInSection>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                    <FadeInSection>
                        <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-6">
                            Quantify Reality
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-lg font-light max-w-md">
                            Every event is a trade. Aura logs these inputs to calculate your emotional volatility with financial precision.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 uppercase tracking-wider">
                            <span className="flex items-center gap-2 text-primary"><Terminal size={14} /> Real-time</span>
                            <span className="w-px h-3 bg-gray-300 dark:bg-gray-700"></span>
                            <span>Secure Protocol</span>
                        </div>
                    </FadeInSection>
                </div>
            </div>
        </section>

        {/* 4. Features - "Index" Style Grid */}
        <section className="relative z-10 py-40 px-6 border-t border-gray-100 dark:border-gray-900">
            <div className="max-w-7xl mx-auto">
                <FadeInSection>
                    <div className="mb-24">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">System Modules</span>
                    </div>
                </FadeInSection>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
                    <FadeInSection delay={0.1}>
                        <FeatureRow 
                            icon={Activity} 
                            title={t('landing.feat_volatility')} 
                            desc={t('landing.feat_volatility_desc')} 
                            index={0}
                        />
                    </FadeInSection>
                    <FadeInSection delay={0.2}>
                        <FeatureRow 
                            icon={TrendingUp} 
                            title={t('landing.feat_biomarket')} 
                            desc={t('landing.feat_biomarket_desc')} 
                            index={1}
                        />
                    </FadeInSection>
                    <FadeInSection delay={0.3}>
                        <FeatureRow 
                            icon={BarChart2} 
                            title={t('landing.feat_logs')} 
                            desc={t('landing.feat_logs_desc')} 
                            index={2}
                        />
                    </FadeInSection>
                    <FadeInSection delay={0.4}>
                        <FeatureRow 
                            icon={CheckSquare} 
                            title={t('landing.feat_checklist')} 
                            desc={t('landing.feat_checklist_desc')} 
                            index={3}
                        />
                    </FadeInSection>
                    <FadeInSection delay={0.5}>
                        <FeatureRow 
                            icon={Calendar} 
                            title={t('landing.feat_planner')} 
                            desc={t('landing.feat_planner_desc')} 
                            index={4}
                        />
                    </FadeInSection>
                    <FadeInSection delay={0.6}>
                        <FeatureRow 
                            icon={Bell} 
                            title={t('landing.feat_reminders')} 
                            desc={t('landing.feat_reminders_desc')} 
                            index={5}
                        />
                    </FadeInSection>
                </div>

                <div className="mt-32 text-center">
                    <FadeInSection delay={0.4}>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,200,150,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleInitialize}
                            className="bg-gray-900 dark:bg-white text-white dark:text-black rounded-full px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-gray-200 transition-all shadow-2xl relative overflow-hidden group"
                        >
                            <span className="relative z-10">Initialize Aura</span>
                            {/* Inner Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </motion.button>
                    </FadeInSection>
                </div>
            </div>
        </section>

        {/* 5. Comparison Section (New) */}
        <ComparisonSection t={t} />

        {/* 6. Proof - Minimal Charts */}
        <section className="relative z-10 py-40 px-6 overflow-hidden bg-gray-50 dark:bg-[#080808]">
            <div className="max-w-6xl mx-auto">
                <FadeInSection>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">{t('landing.proof_title')}</h2>
                            <p className="text-gray-500 max-w-md font-light">{t('landing.proof_desc')}</p>
                        </div>
                        <div className="flex items-center gap-3 text-primary">
                            <Shield size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('landing.proof_join')}</span>
                        </div>
                    </div>
                </FadeInSection>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Bullish Chart */}
                    <FadeInSection delay={0.1}>
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 h-[300px] flex flex-col justify-between hover:border-primary/30 transition-colors duration-500">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">{t('landing.bullish_year')}</span>
                                <ArrowUpRight className="text-primary" size={20} />
                            </div>
                            <div className="flex items-end justify-between gap-2 h-32">
                                {[20,30,25,40,35,50,45,60,55,70,65,80,75,90].map((h,i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i*0.05, duration: 0.5 }}
                                        className="w-full bg-primary opacity-90 shadow-[0_0_10px_rgba(0,200,150,0.2)]"
                                    />
                                ))}
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Bearish Chart */}
                    <FadeInSection delay={0.2}>
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 h-[300px] flex flex-col justify-between hover:border-red-500/30 transition-colors duration-500">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">{t('landing.bearish_month')}</span>
                                <ArrowDownRight className="text-danger" size={20} />
                            </div>
                            <div className="flex items-end justify-between gap-2 h-32">
                                {[80,70,75,60,65,50,55,40,45,30,35,20,25,10].map((h,i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i*0.05, duration: 0.5 }}
                                        className="w-full bg-danger opacity-90 shadow-[0_0_10px_rgba(255,95,95,0.2)]"
                                    />
                                ))}
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </div>
        </section>

        {/* 7. Footer - Minimal */}
        <footer className="relative z-10 py-20 px-6 bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-gray-900">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-center md:text-left">
                    <Logo className="w-6 h-6 mb-4 mx-auto md:mx-0 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-400">© 2026 Aura Systems.</p>
                </div>
                
                <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <button onClick={onTerms} className="hover:text-primary transition-colors">Terms</button>
                    <button onClick={onFAQ} className="hover:text-primary transition-colors">FAQ</button>
                    <a href="mailto:support@auraplot.site" className="hover:text-primary transition-colors">Support</a>
                </div>
            </div>
        </footer>
    </motion.div>
  );
};
