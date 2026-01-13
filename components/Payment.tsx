
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Check, Loader2, Lock, ExternalLink, Clock, Wallet, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface PaymentProps {
  onBack: () => void;
  onSuccess: () => Promise<void>;
  plan: 'monthly' | 'lifetime';
}

export const Payment: React.FC<PaymentProps> = ({ onBack, onSuccess, plan }) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'waiting'>('idle');

  // External Payment Links
  const PAYMENT_URLS = {
      monthly: "https://moonpay.hel.io/pay/694baa5fb905fbae51d526b2",
      lifetime: "https://moonpay.hel.io/pay/6960eb543349f9e867b4a401"
  };
  const BINANCE_URL = "https://www.bmwweb.ac/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_BD3FV&utm_source=default";

  const handlePayClick = () => {
    window.open(PAYMENT_URLS[plan], '_blank');
    setStatus('waiting');
  };

  const priceLabel = plan === 'monthly' ? '$1.20' : '$10.00';
  const itemLabel = plan === 'monthly' ? t('payment.summary_item') : 'Aura Pro (Lifetime)';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans"
    >
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

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
             
             {/* Header */}
             <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <Lock size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">{t('payment.title')}</h1>
                <p className="text-gray-400 text-sm mt-2">{t('payment.powered_by')}</p>
             </div>

             {/* Order Summary */}
             <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">{itemLabel}</span>
                    <span className="font-mono text-white font-bold">{priceLabel}</span>
                </div>
                <div className="h-px bg-white/10 my-3"></div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{t('payment.processing_fee')}</span>
                    <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2">
                    <span className="text-sm font-bold text-white">{t('payment.total')}</span>
                    <span className="text-xl font-mono text-primary font-bold">{priceLabel}</span>
                </div>
             </div>

             {/* Action Area */}
             <div className="min-h-[100px] flex flex-col justify-center relative">
                
                {status === 'idle' && (
                    <>
                        <button 
                            onClick={handlePayClick}
                            className="w-full bg-white text-black font-bold h-12 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mb-4"
                        >
                            {t('payment.pay_button')} <ExternalLink size={16} />
                        </button>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl text-primary border border-white/5">
                                    <Wallet size={18} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-1">
                                        {t('payment.no_wallet_title')}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3 max-w-[240px]">
                                        {t('payment.create_wallet_desc')}
                                    </p>
                                    <a 
                                        href={BINANCE_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-white transition-colors group"
                                    >
                                        {t('payment.create_wallet_btn')} 
                                        <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {status === 'waiting' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center gap-4"
                    >
                         <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{t('payment.manual_verify_title')}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                                {t('payment.manual_verify_text')}
                            </p>
                        </div>
                        <button 
                            onClick={onBack}
                            className="mt-2 text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white pb-0.5"
                        >
                            {t('payment.return_dash')}
                        </button>
                    </motion.div>
                )}
             </div>

             <div className="mt-8 flex justify-center items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                <Shield size={10} /> {t('payment.secure_badge')}
             </div>
        </div>
      </div>
    </motion.div>
  );
};
