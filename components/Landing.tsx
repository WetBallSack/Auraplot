import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { Crown, TrendingUp, Activity, BarChart2, Shield, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

// --- SUB-COMPONENTS ---

const InteractiveSimulator = ({ onInteract }: { onInteract: () => void }) => {
    const { t } = useLanguage();
    const [intensity, setIntensity] = useState(5);
    const [isBullish, setIsBullish] = useState(true);
    const [eventName, setEventName] = useState("");

    return (
        <div 
            className="w-full max-w-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/60 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl allow-internal-scroll overflow-y-auto max-h-[55vh] md:max-h-none md:overflow-visible"
            onMouseEnter={onInteract}
            onTouchStart={onInteract}
        >
            <div className="flex justify-between items-start mb-6 md:mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('landing.simulator_title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">{t('landing.simulator_desc')}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest text-gray-500 shrink-0 ml-2">
                    Live Demo
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Controls */}
                <div className="flex-1 space-y-6">
                    <div>
                        <input 
                            type="text" 
                            placeholder={t('landing.sim_placeholder')}
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between mb-2">
                             <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('landing.sim_intensity')}</label>
                             <span className="font-mono text-xs font-bold text-accent dark:text-white">{intensity}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="0.1"
                            value={intensity}
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsBullish(true)}
                            className={clsx("flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border", 
                                isBullish ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-transparent text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary")}
                        >
                            {t('landing.sim_bullish')}
                        </button>
                        <button 
                             onClick={() => setIsBullish(false)}
                             className={clsx("flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border", 
                                !isBullish ? "bg-danger text-white border-danger shadow-lg shadow-danger/30" : "bg-transparent text-gray-400 border-gray-200 dark:border-gray-700 hover:border-danger")}
                        >
                            {t('landing.sim_bearish')}
                        </button>
                    </div>
                </div>

                {/* Candle Visual */}
                <div className="w-full md:w-24 h-32 md:h-48 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center relative border border-gray-200 dark:border-gray-800 shrink-0">
                     {/* Center Line */}
                     <div className="absolute w-0.5 bg-gray-300 dark:bg-gray-600 h-[80%] rounded-full"></div>
                     
                     {/* Candle Body */}
                     <motion.div 
                        className={clsx("w-6 rounded-sm relative z-10 shadow-lg", isBullish ? "bg-primary shadow-primary/40" : "bg-danger shadow-danger/40")}
                        animate={{ 
                            height: `${intensity * 8}%`,
                            y: isBullish ? -10 : 10
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                     />
                </div>
            </div>
        </div>
    );
};

const FeaturesTicker = () => {
    const { t } = useLanguage();
    const features = [
        { icon: Activity, title: t('landing.feat_volatility'), desc: t('landing.feat_volatility_desc') },
        { icon: TrendingUp, title: t('landing.feat_biomarket'), desc: t('landing.feat_biomarket_desc') },
        { icon: BarChart2, title: t('landing.feat_logs'), desc: t('landing.feat_logs_desc') },
    ];

    return (
        <div className="w-full max-w-5xl allow-internal-scroll overflow-y-auto no-scrollbar max-h-[55vh] md:max-h-none md:overflow-visible px-2 pb-4">
            <h2 className="text-2xl md:text-4xl font-light text-center mb-8 md:mb-16 text-gray-900 dark:text-white tracking-tight">{t('landing.features_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center text-center group"
                    >
                        {/* High-end Icon Container */}
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-105 transition-all duration-500 shadow-xl shadow-gray-200/50 dark:shadow-black/50 relative overflow-hidden shrink-0">
                             {/* Subtle shine effect */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                             
                             <feat.icon size={28} strokeWidth={1.5} className="text-gray-900 dark:text-white" />
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 md:mb-3 tracking-tight">{feat.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ProofOfGrowth = () => {
    const { t } = useLanguage();
    return (
        <div className="w-full max-w-4xl flex flex-col items-center allow-internal-scroll overflow-y-auto no-scrollbar max-h-[55vh] md:max-h-none md:overflow-visible px-2">
            <div className="text-center mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white tracking-tight mb-2">{t('landing.proof_title')}</h2>
                <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto">{t('landing.proof_desc')}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
                {/* Chart Comparison */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold uppercase text-gray-400">{t('landing.bullish_year')}</span>
                        <ArrowUpRight className="text-primary" size={20} />
                    </div>
                    {/* Mock Bullish Chart */}
                    <div className="h-24 flex items-end justify-between gap-1">
                        {[20,30,25,40,35,50,45,60,55,70,65,80,75,90].map((h,i) => (
                             <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i*0.05 }}
                                className="w-full bg-primary/20 rounded-t-sm"
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold uppercase text-gray-400">{t('landing.bearish_month')}</span>
                        <ArrowDownRight className="text-danger" size={20} />
                    </div>
                    {/* Mock Bearish Chart */}
                    <div className="h-24 flex items-end justify-between gap-1">
                        {[80,70,75,60,65,50,55,40,45,30,35,20,25,10].map((h,i) => (
                             <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i*0.05 }}
                                className="w-full bg-danger/20 rounded-t-sm"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-bold mb-8 md:mb-0">
                 <Shield size={12} /> {t('landing.proof_join')}
            </div>
        </div>
    );
};

const GlassSlider = ({ total, current, onChange }: { total: number, current: number, onChange: (i: number) => void }) => (
    // Update: Moved to top-left (top-8 left-6) on mobile, center-left on desktop.
    <div className="fixed z-40 left-6 top-8 md:left-8 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:translate-x-0">
        <div className="flex flex-row md:flex-col gap-4 p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onChange(i)}
                    className="group relative flex items-center justify-center focus:outline-none"
                >
                    <div 
                        className={clsx(
                            "rounded-full transition-all duration-500 ease-out",
                            i === current 
                                ? 'bg-primary shadow-[0_0_12px_rgba(0,200,150,0.8)] opacity-100' 
                                : 'bg-primary/20 group-hover:bg-primary/50',
                            // Responsive sizing:
                            // Mobile: Horizontal (Active: Wide, Inactive: Short Line)
                            // Desktop: Vertical (Active: Tall, Inactive: Short Line)
                            i === current
                                ? "w-8 h-1 md:w-1 md:h-8" 
                                : "w-2 h-1 md:w-1 md:h-2" // Short line instead of dot
                        )} 
                    />
                </button>
            ))}
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const Landing: React.FC<{ onEnter: () => void, onPricing: () => void, onTerms: () => void, onFAQ: () => void }> = ({ onEnter, onPricing, onTerms, onFAQ }) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [initializing, setInitializing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  
  // Ref for scroll throttling
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const SLIDES = [
    { id: 0, type: 'hero' },
    { id: 1, type: 'pain-killer' },
    { id: 2, type: 'simulator' },
    { id: 3, type: 'features' },
    { id: 4, type: 'proof' },
  ];

  // Lock Body Scroll on Mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, []);

  const changeSlide = (direction: 'next' | 'prev') => {
      const now = Date.now();
      if (now - lastScrollTime.current < 800) return; // Debounce
      
      lastScrollTime.current = now;
      setIsHovering(true); // Pause auto-rotate

      if (direction === 'next') {
          if (currentSlide < SLIDES.length - 1) {
              setCurrentSlide(prev => prev + 1);
              setShowFooter(false);
          } else {
              // On last slide, next scroll reveals footer
              setShowFooter(true);
          }
      } else {
          if (showFooter) {
              setShowFooter(false);
          } else if (currentSlide > 0) {
              setCurrentSlide(prev => prev - 1);
          }
      }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        // Check if we are scrolling inside a scrollable element
        const target = e.target as HTMLElement;
        const scrollable = target.closest('.allow-internal-scroll');
        
        if (scrollable) {
            const { scrollTop, scrollHeight, clientHeight } = scrollable;
            const isAtTop = scrollTop <= 0;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 1;

            // If scrolling down AND not at bottom, allow default scroll (don't change slide)
            if (e.deltaY > 0 && !isAtBottom) {
                return;
            }
            // If scrolling up AND not at top, allow default scroll
            if (e.deltaY < 0 && !isAtTop) {
                return;
            }
        }

        // Otherwise, prevent default and change slide
        e.preventDefault(); 
        
        if (Math.abs(e.deltaY) > 10) {
            changeSlide(e.deltaY > 0 ? 'next' : 'prev');
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        
        // Check if we are scrolling inside a scrollable element
        const target = e.target as HTMLElement;
        const scrollable = target.closest('.allow-internal-scroll');

        if (scrollable) {
            const { scrollTop, scrollHeight, clientHeight } = scrollable;
            const isAtTop = scrollTop <= 0;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 1;

            // Swipe Up (Scroll Down)
            if (diff > 0 && !isAtBottom) return;

            // Swipe Down (Scroll Up)
            if (diff < 0 && !isAtTop) return;
        }

        if (Math.abs(diff) > 50) { // Threshold for swipe
             changeSlide(diff > 0 ? 'next' : 'prev');
        }
    };

    // Use { passive: false } to allow preventDefault to block native scroll
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSlide, showFooter]);

  useEffect(() => {
    if (!isHovering && !showFooter) {
        slideTimer.current = setInterval(() => {
            setCurrentSlide((prev) => {
                const next = (prev + 1) % SLIDES.length;
                return next;
            });
        }, 12000); 
    }

    return () => {
        if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [isHovering, showFooter, SLIDES.length]);

  const handleInitialize = () => {
      setInitializing(true);
      setTimeout(() => {
          onEnter();
      }, 1200);
  };

  const renderSlideContent = (index: number) => {
      switch(index) {
          case 0: // Hero
            return (
                <div className="text-center">
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-12"
                    >
                        <Logo className="w-32 h-32 text-gray-900 dark:text-white stroke-[1.5]" />
                    </motion.div>
                    <h2 className="text-5xl md:text-8xl font-light tracking-tighter text-gray-900 dark:text-white mb-6">
                        Aura
                    </h2>
                    <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500 max-w-lg mx-auto leading-relaxed">
                        {t('landing.subtitle')}
                    </p>
                </div>
            );
        case 1: // Pain Killer
            return (
                <div className="text-center max-w-2xl px-6 allow-internal-scroll overflow-y-auto max-h-[55vh] md:max-h-none md:overflow-visible">
                     <h2 className="text-3xl md:text-6xl font-light tracking-tighter text-gray-900 dark:text-white mb-6 md:mb-8">
                        {t('landing.pain_killer_title')}
                     </h2>
                     <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                        {t('landing.pain_killer_desc')}
                     </p>
                </div>
            );
        case 2: // Simulator
            return <InteractiveSimulator onInteract={() => setIsHovering(true)} />;
        case 3: // Features
            return <FeaturesTicker />;
        case 4: // Proof
            return <ProofOfGrowth />;
        default:
            return null;
      }
  };

  return (
    // Fixed container ensures we own the scroll behavior completely
    <div className="fixed inset-0 z-[100] bg-[#F9FAFB] dark:bg-gray-900 transition-colors duration-500 font-sans selection:bg-primary selection:text-white flex flex-col overflow-hidden">
        
        {/* Permanent SEO H1 - Hidden visually */}
        <h1 className="sr-only">Aura - The Mint Terminal for Life's Market Data</h1>

        {/* Navbar */}
        <div className="absolute top-8 right-8 z-50 flex items-center gap-4 md:gap-6">
            <button 
                onClick={onPricing} 
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
            >
                <Crown size={14} /> <span className="hidden md:inline">{t('landing.pricing')}</span>
            </button>
            <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
            </div>
        </div>

        {/* Massive Central Aura - The "Atmosphere" */}
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3], 
            }}
            transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] md:w-[1000px] md:h-[1000px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" 
        />
        
        {/* Drifting Green Cloud - Moving freely, not stuck in corner */}
         <motion.div 
            animate={{ 
                x: [-100, 100, -100],
                y: [-50, 50, -50],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
            }}
            transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-60" 
        />
        
        {/* Secondary Teal Cloud - Balancing the other side */}
         <motion.div 
            animate={{ 
                x: [100, -100, 100],
                y: [50, -50, 50],
                scale: [1.2, 1, 1.2]
            }}
            transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none opacity-50" 
        />

        {/* Content Wrapper that translates up to reveal footer */}
        <motion.div 
            className="flex-1 w-full h-full flex flex-col items-center justify-center relative z-10"
            animate={{ y: showFooter ? -120 : 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
             {/* Slider Navigation */}
            <GlassSlider 
                total={SLIDES.length} 
                current={currentSlide} 
                onChange={(i) => {
                    setCurrentSlide(i);
                    setShowFooter(false);
                    setIsHovering(true);
                }} 
            />

            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center justify-center">
                <div className="relative w-full h-[65vh] md:h-[600px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.98 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {renderSlideContent(currentSlide)}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Initialize Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-20 md:bottom-12 z-30"
                >
                    <button
                        onClick={handleInitialize}
                        disabled={initializing}
                        className={clsx(
                            "relative overflow-hidden rounded-full border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold tracking-widest hover:bg-white dark:hover:bg-white/10 hover:shadow-2xl hover:scale-105 transition-all uppercase backdrop-blur-md group",
                            currentSlide === 0 
                                ? "px-12 py-5 text-xs" 
                                : "px-8 py-3 text-[10px] md:px-12 md:py-5 md:text-xs"
                        )}
                    >
                        <span className="relative z-10">{t('landing.initialize')}</span>
                        {initializing && (
                                <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                className="absolute inset-0 bg-primary/30 dark:bg-white/20 z-0"
                                />
                        )}
                    </button>
                </motion.div>

                {/* Footer Hint */}
                {currentSlide === SLIDES.length - 1 && !showFooter && (
                     <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 animate-bounce cursor-pointer"
                        onClick={() => setShowFooter(true)}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                )}
            </div>
        </motion.div>
        
        {/* Internal Footer for Landing Page */}
        <motion.div 
            initial={{ y: 200 }}
            animate={{ y: showFooter ? 0 : 200 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="absolute bottom-0 w-full py-6 md:py-8 flex justify-center z-50 pointer-events-auto"
        >
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 px-4">
                {/* Support Link */}
                <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-xl flex items-center gap-3 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-300 group">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                            Support
                        </span>
                    </div>
                    <div className="h-3 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
                    <a href="mailto:support@auraplot.site" className="text-[11px] font-bold text-gray-800 dark:text-white hover:text-primary dark:hover:text-primary transition-colors select-text font-mono block">
                        support@auraplot.site
                    </a>
                </div>

                {/* FAQ Link */}
                <button 
                    onClick={onFAQ}
                    className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 px-4 py-2 md:px-4 md:py-2.5 rounded-full shadow-xl text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-white/50 dark:hover:bg-black/50 hover:text-gray-800 dark:hover:text-white transition-all duration-300"
                >
                    FAQ
                </button>

                {/* Terms Link */}
                <button 
                    onClick={onTerms}
                    className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 px-4 py-2 md:px-4 md:py-2.5 rounded-full shadow-xl text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-white/50 dark:hover:bg-black/50 hover:text-gray-800 dark:hover:text-white transition-all duration-300"
                >
                    Terms
                </button>
            </div>
        </motion.div>
    </div>
  );
};