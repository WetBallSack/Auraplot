import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

interface UpdatePasswordProps {
    onSuccess: () => void;
}

export const UpdatePassword: React.FC<UpdatePasswordProps> = ({ onSuccess }) => {
  const { changePassword } = useAuth();
  const { t } = useLanguage();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError(t('auth.pass_mismatch'));
        return;
    }
    setLoading(true);
    setError('');

    try {
        // We use the same changePassword function, but in Recovery mode, Supabase 
        // treats it as a reset if we have the recovery session active (which we do).
        // Note: Supabase updatePassword requires us to be logged in, which clicking the link does.
        await changePassword(password, password); // Param compatibility
        onSuccess();
    } catch (err: any) {
        setError(err.message || 'Failed to update password');
        setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-gray-900 p-4 relative"
    >
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Logo className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-accent dark:text-white tracking-tight">{t('auth.update_password')}</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('auth.set_new_pass')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
            
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.new_pass')}</label>
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

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('auth.confirm_pass')}</label>
                <div className="relative">
                    <input 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    />
                    <CheckCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent dark:bg-primary text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary dark:hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="animate-pulse">{t('auth.saving')}</span>
                ) : (
                    <> {t('auth.save_pass')} <ArrowRight size={16} /></>
                )}
            </button>
        </form>
      </div>
    </motion.div>
  );
};