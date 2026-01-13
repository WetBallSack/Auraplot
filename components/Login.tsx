
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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
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

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-accent dark:text-primary">
                <Logo className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-accent dark:text-white tracking-tight">{t('auth.access_terminal')}</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('auth.identify')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.identity_email')}</label>
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@aura.sys" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                />
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
                    <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                </div>
            </div>

            <div className="text-right">
                <button 
                    type="button" 
                    onClick={onForgotPassword}
                    className="text-xs text-gray-400 hover:text-primary transition-colors"
                >
                    {t('auth.forgot_credentials')}
                </button>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent dark:bg-primary text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary dark:hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="animate-pulse">{t('auth.authenticating')}</span>
                ) : (
                    <> {t('auth.enter_aura')} <ArrowRight size={16} /></>
                )}
            </button>
        </form>
        
        <div className="mt-8 text-center space-y-4">
             <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t('auth.no_id')} <button onClick={onRegister} className="text-primary font-bold hover:underline">{t('auth.create_account')}</button>
             </p>
        </div>
      </div>
    </motion.div>
  );
};
