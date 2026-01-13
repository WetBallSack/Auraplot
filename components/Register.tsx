
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { ArrowRight, UserPlus, Mail, Lock, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface RegisterProps {
    onLogin: () => void;
    onBack: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin, onBack }) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        await register(name, email, password);
        setLoading(false);
        setShowVerificationModal(true);
    } catch (err: any) {
        setError(err.message || 'Registration failed');
        setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-gray-900 p-4 relative"
    >
      <div className="absolute top-6 left-6">
         <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
            <ArrowLeft size={24} />
         </button>
      </div>
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors relative z-10">
        <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-accent dark:text-white tracking-tight">{t('auth.establish_identity')}</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('auth.create_protocol')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.full_name')}</label>
                <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.email_protocol')}</label>
                <div className="relative">
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@aura.sys" 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    />
                    <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.passkey')}</label>
                <div className="relative">
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    />
                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
                {loading ? (
                    <span className="animate-pulse">{t('auth.initializing')}</span>
                ) : (
                    <>{t('auth.create_account')} <ArrowRight size={16} /></>
                )}
            </button>
        </form>
        
        <div className="mt-6 space-y-4">
             <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t('auth.already_registered')} <button onClick={onLogin} className="text-accent dark:text-white font-bold hover:underline">{t('auth.log_in')}</button>
             </p>
        </div>
      </div>

      {/* Verification Popup Modal */}
      <AnimatePresence>
        {showVerificationModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative w-full max-w-sm bg-white/10 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Decorative Shine */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,200,150,0.3)]">
                            <Mail size={32} className="text-primary" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">{t('auth.check_inbox')}</h3>
                        <p className="text-gray-200 dark:text-gray-300 text-sm leading-relaxed mb-8">
                            {t('auth.sent_link')} <span className="text-primary font-bold">{email}</span>. 
                            <br/><br/>
                            {t('auth.confirm_identity')}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <Sparkles size={12} className="text-yellow-400" /> 
                            <span>{t('auth.waiting_signal')}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
