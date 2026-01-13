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
        
        {!sent ? (
            <>
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-500 dark:text-gray-300">
                        <Key size={24} className="lucide lucide-key" />
                    </div>
                    <h1 className="text-2xl font-semibold text-accent dark:text-white tracking-tight">Recovery Mode</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 text-center">
                        Enter your identity protocol (email) to receive a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Protocol</label>
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

                    <button 
                        type="submit"
                        disabled={loading || !email}
                        className="w-full bg-accent dark:bg-primary text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-primary dark:hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-primary rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-accent dark:text-white mb-2">Transmission Complete</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                    A secure recovery key has been sent to <strong>{email}</strong>. Please check your inbox to restore access.
                </p>
                <button 
                    onClick={onBack}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Return to Login
                </button>
            </motion.div>
        )}
      </div>
    </motion.div>
  );
};