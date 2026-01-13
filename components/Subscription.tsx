
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { Check, ArrowLeft, Shield, Zap, TrendingUp, Download, Star, ArrowRight } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

interface SubscriptionProps {
  onBack: () => void;
  onProceed: (plan: 'monthly' | 'lifetime') => void;
  isAuthenticated: boolean;
  onLoginRequest: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ onBack, onProceed, isAuthenticated, onLoginRequest }) => {
  const { t } = useLanguage();
  const [plan, setPlan] = useState<'monthly' | 'lifetime'>('monthly');

  const handleAction = () => {
    if (!isAuthenticated) {
        onLoginRequest();
    } else {
        onProceed(plan);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans"
    >
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -right-[20%] w-[80vw] h-[80vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.3, 0.1],
                    x: [0, -50, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-[40%] -left-[20%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"
            />
        </div>

      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all text-gray-300 hover:text-white group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
         <LanguageToggle className="!bg-white/10 !text-white hover:!bg-white/20 border-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Value Prop */}
        <div className="space-y-8 text-center lg:text-left pt-12 lg:pt-0">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full"
             >
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-gray-300">{t('subscription.premium_tier')}</span>
             </motion.div>

             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-7xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40"
             >
                {t('subscription.title')} <br/>
                <span className="font-serif italic text-primary">{t('subscription.title_highlight')}</span>
             </motion.h1>
             
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 font-light"
             >
                {t('subscription.subtitle')}
             </motion.p>

             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="grid grid-cols-2 gap-6 pt-4"
             >
                {[
                    { icon: TrendingUp, title: t('subscription.predictive_ai'), desc: t('subscription.predictive_desc') },
                    { icon: Download, title: t('subscription.export_4k'), desc: t('subscription.export_desc') },
                    { icon: Zap, title: t('subscription.real_time'), desc: t('subscription.real_time_desc') },
                    { icon: Shield, title: t('subscription.encrypted'), desc: t('subscription.encrypted_desc') }
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-500 border border-transparent hover:border-white/5">
                        <div className="p-2.5 bg-white/10 text-primary rounded-xl backdrop-blur-sm">
                            <item.icon size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-white text-sm">{item.title}</h3>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
             </motion.div>
        </div>

        {/* Right: Pricing Card (Glassmorphism) */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
        >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-[60px] rounded-full transform rotate-12 scale-75 animate-pulse"></div>

            <div className="relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden min-h-[520px] flex flex-col justify-between">
                
                {/* Shine effect */}
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b from-transparent via-white/5 to-transparent rotate-45 pointer-events-none animate-shine" />

                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <Logo className="w-10 h-10 text-white" />
                        <div className="px-3 py-1 bg-primary/20 border border-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,200,150,0.3)]">
                            {t('subscription.limited_access')}
                        </div>
                    </div>

                    {/* Plan Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 p-1 rounded-xl flex relative">
                            <motion.div
                                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
                                initial={false}
                                animate={{
                                    left: plan === 'monthly' ? '4px' : '50%',
                                    width: 'calc(50% - 4px)'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => setPlan('monthly')}
                                className={clsx(
                                    "relative z-10 w-24 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors uppercase tracking-wider",
                                    plan === 'monthly' ? "text-black" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPlan('lifetime')}
                                className={clsx(
                                    "relative z-10 w-24 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors uppercase tracking-wider",
                                    plan === 'lifetime' ? "text-black" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Lifetime
                            </button>
                        </div>
                    </div>

                    <div className="mb-8 text-center">
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={plan}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-6xl font-light text-white"
                                >
                                    {plan === 'monthly' ? '$1.20' : '$10'}
                                </motion.span>
                            </AnimatePresence>
                            {plan === 'monthly' && (
                                <span className="text-gray-400 font-medium text-lg">{t('subscription.per_month')}</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {plan === 'monthly' ? t('subscription.billing_period') : 'One-time payment. Forever access.'}
                        </p>
                    </div>

                    <div className="space-y-4 mb-10 flex-1">
                        {[
                            t('subscription.feat_logging'), 
                            t('subscription.feat_analysis'), 
                            t('subscription.feat_risk'), 
                            t('subscription.feat_processing')
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{feat}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Action Button */}
                    <div className="w-full relative min-h-[60px] flex flex-col items-center justify-center">
                        <button 
                            onClick={handleAction}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {isAuthenticated ? t('subscription.proceed_checkout') : t('subscription.login_upgrade')} <ArrowRight size={18} />
                        </button>
                    </div>
                    
                    <p className="text-center text-[10px] text-gray-600 mt-6 flex items-center justify-center gap-1.5">
                        <Shield size={10} /> {t('subscription.secure_payment')}
                    </p>
                </div>
            </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
