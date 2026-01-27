
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { ArrowLeft, Mail, CheckCircle, Key, AlertCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { api } from '../services/api';

interface ForgotPasswordProps {
    onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await api.resetPasswordForEmail(email);
        setSent(true);
    } catch (err: any) {
        setError(err.message || "Failed to send reset link.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#000000] p-6 relative overflow-hidden"
    >
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
        
        {!sent ? (
            <>
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-black rounded-3xl flex items-center justify-center mb-6 text-gray-500 dark:text-gray-300 shadow-inner border border-gray-100 dark:border-white/5">
                        <Key size={24} />
                    </div>
                    <h1 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight text-center">Recovery Mode</h1>
                    <p className="text-gray-400 text-sm mt-3 text-center font-light leading-relaxed">
                        Enter your identity protocol to receive a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs flex items-center gap-3">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Protocol</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@aura.sys" 
                                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white placeholder:text-gray-500"
                            />
                            <Mail size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 opacity-50" />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || !email}
                        className="w-full bg-[#00C896] hover:bg-[#00B084] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,200,150,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Transmitting...' : 'Send Recovery Link'}
                    </button>
                </form>
            </>
        ) : (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center"
            >
                <div className="w-16 h-16 bg-green-500/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,200,150,0.2)]">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-light text-white mb-4">Transmission Complete</h3>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed max-w-[280px]">
                    A secure recovery key has been sent to <br/><strong className="text-white">{email}</strong>.<br/> Please check your inbox to restore access.
                </p>
                <button 
                    onClick={onBack}
                    className="w-full bg-white/5 text-white border border-white/10 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                    Return to Login
                </button>
            </motion.div>
        )}
      </div>
    </div>
    </motion.div>
  );
};
