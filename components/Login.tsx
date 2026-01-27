
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { ArrowRight, Key, AlertCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
    onRegister: () => void;
    onForgotPassword: () => void;
    onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onRegister, onForgotPassword, onBack }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await login(email, password);
    } catch (err: any) {
        setError(err.message || t('auth.login_failed'));
        setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#000000] p-6 relative overflow-hidden"
    >
      {/* Ambient Background - Subtle Green */}
      <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="absolute top-8 left-8 z-50">
         <button onClick={onBack} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-xs font-medium text-gray-500 hover:text-white">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
         </button>
      </div>
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        <LanguageToggle className="!bg-white/5 !border-white/5 hover:!bg-white/10 !text-white" />
        <ThemeToggle className="!bg-white/5 !border-white/5 hover:!bg-white/10 !text-white" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-[#1C1C1E] p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 transition-all duration-500">
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-gray-50 dark:bg-black rounded-3xl flex items-center justify-center mb-6 text-primary shadow-inner border border-gray-100 dark:border-white/5">
                    <Logo className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight text-center">{t('auth.access_terminal')}</h1>
                <p className="text-gray-400 text-sm mt-3 text-center font-light">{t('auth.identify')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs flex items-center gap-3"
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}
                
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('auth.identity_email')}</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@aura.sys" 
                        className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white placeholder:text-gray-500"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('auth.passkey')}</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white placeholder:text-gray-500"
                        />
                        <Key size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 opacity-50" />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={onForgotPassword}
                        className="text-xs font-medium text-gray-400 hover:text-primary transition-colors"
                    >
                        {t('auth.forgot_credentials')}
                    </button>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00C896] hover:bg-[#00B084] text-white h-14 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,200,150,0.3)]"
                >
                    {loading ? (
                        <span className="animate-pulse">{t('auth.authenticating')}</span>
                    ) : (
                        <> {t('auth.enter_aura')} <ArrowRight size={16} /></>
                    )}
                </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
                 <p className="text-center text-xs text-gray-500">
                    {t('auth.no_id')} <button onClick={onRegister} className="text-gray-900 dark:text-white font-bold hover:text-primary ml-1">{t('auth.create_account')}</button>
                 </p>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
