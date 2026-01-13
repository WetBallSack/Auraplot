import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Lock, User, AlertCircle, CheckCircle, Globe, Mail, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { api } from '../services/api';

export const Settings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, updateName, changePassword, updateEmail } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [loadingName, setLoadingName] = useState(false);
  const [msgName, setMsgName] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [email, setEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [msgEmail, setMsgEmail] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [msgPass, setMsgPass] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [deleting, setDeleting] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    setMsgName(null);
    try {
        await updateName(name);
        setMsgName({ type: 'success', text: 'Identity updated successfully.' });
    } catch (err: any) {
        setMsgName({ type: 'error', text: err.message });
    } finally {
        setLoadingName(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoadingEmail(true);
      setMsgEmail(null);
      try {
          await updateEmail(email);
          setShowEmailModal(true);
          setEmail('');
      } catch (err: any) {
          setMsgEmail({ type: 'error', text: err.message });
      } finally {
          setLoadingEmail(false);
      }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
        setMsgPass({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
    }
    setLoadingPass(true);
    setMsgPass(null);
    try {
        await changePassword(oldPass, newPass);
        setMsgPass({ type: 'success', text: 'Passkey updated successfully.' });
        setOldPass('');
        setNewPass('');
    } catch (err: any) {
        setMsgPass({ type: 'error', text: err.message });
    } finally {
        setLoadingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
      if (confirm("DANGER: Are you sure you want to delete your account? All logs and settings will be permanently erased. This cannot be undone.")) {
          setDeleting(true);
          try {
              await api.deleteAccount();
              // Auth context listener will redirect to landing
          } catch (error) {
              alert("Failed to delete account. Please try again or contact support.");
              setDeleting(false);
          }
      }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 flex flex-col items-center pt-20 pb-12 px-4 transition-colors"
    >
      <div className="fixed top-8 left-8 z-50">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500">
            <ArrowLeft size={24} />
        </button>
      </div>
      <div className="fixed top-8 right-8 z-50 flex items-center gap-3">
         <LanguageToggle />
         <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-accent dark:text-white">
                <Logo className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-accent dark:text-white">{t('settings.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('settings.subtitle')}</p>
            </div>
        </div>

        <div className="space-y-6">
            
            {/* Language Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Globe className="text-primary" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('settings.language')}</h2>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-accent dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('zh')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${language === 'zh' ? 'bg-white dark:bg-gray-700 shadow-sm text-accent dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        中文
                    </button>
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <User className="text-primary" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('settings.identity_protocol')}</h2>
                </div>
                
                <form onSubmit={handleUpdateName} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('settings.display_name')}</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>
                    {msgName && (
                        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${msgName.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                            {msgName.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {msgName.text}
                        </div>
                    )}
                    <button 
                        type="submit"
                        disabled={loadingName}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loadingName ? t('settings.updating') : t('settings.update_identity')} <Save size={16} />
                    </button>
                </form>
            </div>

            {/* Email Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <Mail className="text-primary" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('settings.email_protocol')}</h2>
                </div>
                
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('settings.current_email')}</label>
                        <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {user?.email}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('settings.new_email')}</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="new@aura.sys"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>
                    {msgEmail && (
                        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${msgEmail.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                            {msgEmail.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {msgEmail.text}
                        </div>
                    )}
                    <button 
                        type="submit"
                        disabled={loadingEmail || !email}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loadingEmail ? t('settings.updating') : t('settings.change_email')} <Save size={16} />
                    </button>
                </form>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="text-primary" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('settings.security_access')}</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('settings.current_passkey')}</label>
                        <input 
                            type="password" 
                            value={oldPass}
                            onChange={(e) => setOldPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('settings.new_passkey')}</label>
                        <input 
                            type="password" 
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="New secure passkey"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    {msgPass && (
                        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${msgPass.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                            {msgPass.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {msgPass.text}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loadingPass || !oldPass || !newPass}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loadingPass ? t('settings.verifying') : t('settings.change_passkey')} <Lock size={16} />
                    </button>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="text-red-500" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-red-100">Danger Zone</h2>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-red-200/70 mb-6">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                <button 
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-white dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                    {deleting ? 'Deleting...' : 'Delete Account'} <Trash2 size={16} />
                </button>
            </div>
        </div>
      </div>

       {/* Email Verification Popup Modal */}
      <AnimatePresence>
        {showEmailModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowEmailModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-sm bg-white/10 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Decorative Shine */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,200,150,0.3)]">
                            <Mail size={32} className="text-primary" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">{t('settings.email_sent')}</h3>
                        <p className="text-gray-200 dark:text-gray-300 text-sm leading-relaxed mb-8">
                            {t('settings.check_email_link')}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <Sparkles size={12} className="text-yellow-400" /> 
                            <span>Pending Confirmation</span>
                        </div>
                        
                        <button 
                            onClick={() => setShowEmailModal(false)}
                            className="mt-8 text-sm text-primary font-bold hover:text-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};