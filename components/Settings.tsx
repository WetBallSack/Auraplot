
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Lock, User, AlertCircle, CheckCircle, Globe, Mail, Sparkles, Trash2, AlertTriangle, Clock, Bell, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { api } from '../services/api';
import clsx from 'clsx';

export const Settings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, updateName, changePassword, updateEmail, updatePreferences } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loadingName, setLoadingName] = useState(false);
  const [msgName, setMsgName] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [email, setEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [msgEmail, setMsgEmail] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Email Reminders
  const [reminders, setReminders] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [msgPass, setMsgPass] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [deleting, setDeleting] = useState(false);

  // Sync state with user context when it loads
  useEffect(() => {
    if (user) {
        setReminders(user.email_reminders || false);
        setName(user.name);
        // If user has a timezone saved, use it, otherwise default to system
        if (user.timezone) setTimezone(user.timezone);
    }
  }, [user]);

  // Force a quiet profile refresh on mount to ensure metadata (is_pro, reminders) is in sync with DB
  useEffect(() => {
    const refreshProfile = async () => {
        try {
            await api.getProfile();
        } catch (e) {
            console.error("Silent refresh failed", e);
        }
    };
    refreshProfile();
  }, []);

  // Get supported timezones
  const timezones = useMemo(() => {
      try {
          // Cast to any to avoid TS error
          return (Intl as any).supportedValuesOf('timeZone');
      } catch (e) {
          return [
              "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", 
              "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney"
          ];
      }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    setMsgName(null);
    try {
        await updateName(name, timezone);
        setMsgName({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
        setMsgName({ type: 'error', text: err.message });
    } finally {
        setLoadingName(false);
    }
  };

  const handleToggleReminders = async () => {
      if (!user?.isPro) {
          alert("Smart Reminders (including 20-min pre-task alerts) are available for Pro users only.");
          return;
      }
      setLoadingReminders(true);
      try {
          const newState = !reminders;
          // Explicitly send boolean
          await updatePreferences({ email_reminders: newState });
          setReminders(newState);
      } catch (e) {
          console.error(e);
          alert("Failed to update preferences. Check network connection.");
          // Revert visual state if failed
          setReminders(!reminders);
      } finally {
          setLoadingReminders(false);
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
      className="min-h-screen bg-[#F9FAFB] dark:bg-[#000000] flex flex-col items-center pt-20 pb-12 px-4 transition-colors"
    >
      <div className="fixed top-8 left-8 z-50">
        <button onClick={onBack} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-xs font-medium text-gray-500 hover:text-white">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
        </button>
      </div>
      <div className="fixed top-8 right-8 z-50 flex items-center gap-3">
         <LanguageToggle className="!bg-white/5 !border-white/5 hover:!bg-white/10 !text-white" />
         <ThemeToggle className="!bg-white/5 !border-white/5 hover:!bg-white/10 !text-white" />
      </div>

      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 shadow-lg">
                <Logo className="w-8 h-8" />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight mb-2">{t('settings.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-light">{t('settings.subtitle')}</p>
            </div>
        </div>

        <div className="space-y-6">
            
            {/* Language Section */}
            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl">
                        <Globe className="text-primary" size={20} />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t('settings.language')}</h2>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#2C2C2E] p-1 rounded-xl border border-gray-100 dark:border-white/5">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${language === 'en' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('zh')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${language === 'zh' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        中文
                    </button>
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl">
                        <User className="text-primary" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t('settings.identity_protocol')}</h2>
                        <p className="text-xs text-gray-400 mt-1">Manage your public display and timezone.</p>
                    </div>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('settings.display_name')}</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock size={10} /> Timezone
                            </label>
                            <div className="relative">
                                <select 
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white font-mono appearance-none truncate pr-10 cursor-pointer"
                                >
                                    {timezones.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

                    {msgName && (
                        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${msgName.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                            {msgName.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {msgName.text}
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            disabled={loadingName}
                            className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {loadingName ? t('settings.updating') : t('settings.update_identity')} <Save size={14} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Notifications Section */}
            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl">
                        <Bell className="text-primary" size={20} />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">Notifications</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-white/5">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            Smart Reminders 
                            {!user?.isPro && <Lock size={12} className="text-gray-400" />}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                            Daily Market Brief + 20min alerts before scheduled tasks.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleToggleReminders}
                            disabled={loadingReminders}
                            className={clsx(
                                "relative w-12 h-7 rounded-full transition-colors focus:outline-none flex items-center border border-transparent",
                                reminders ? "bg-primary" : "bg-gray-200 dark:bg-white/10",
                                !user?.isPro && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <motion.div 
                                className="w-5 h-5 bg-white rounded-full shadow-sm ml-1"
                                animate={{ x: reminders ? 20 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                </div>
                {!user?.isPro && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-end">
                        <Crown size={12} className="text-yellow-500" />
                        <span>Upgrade to <strong>Aura Pro</strong> to enable.</span>
                    </div>
                )}
            </div>

            {/* Email Section */}
            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl">
                        <Mail className="text-primary" size={20} />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t('settings.email_protocol')}</h2>
                </div>
                
                <form onSubmit={handleUpdateEmail} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('settings.current_email')}</label>
                        <div className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {user?.email}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('settings.new_email')}</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="new@aura.sys"
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white placeholder:text-gray-500"
                        />
                    </div>
                    {msgEmail && (
                        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${msgEmail.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                            {msgEmail.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {msgEmail.text}
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            disabled={loadingEmail || !email}
                            className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {loadingEmail ? t('settings.updating') : t('settings.change_email')} <Save size={14} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl">
                        <Lock className="text-primary" size={20} />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">{t('settings.security_access')}</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('settings.current_passkey')}</label>
                        <input 
                            type="password" 
                            value={oldPass}
                            onChange={(e) => setOldPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white placeholder:text-gray-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('settings.new_passkey')}</label>
                        <input 
                            type="password" 
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="New secure passkey"
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white placeholder:text-gray-500"
                        />
                    </div>

                    {msgPass && (
                        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${msgPass.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                            {msgPass.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {msgPass.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            disabled={loadingPass || !oldPass || !newPass}
                            className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {loadingPass ? t('settings.verifying') : t('settings.change_passkey')} <Lock size={14} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/10">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                    <AlertTriangle size={20} />
                    <h2 className="text-lg font-bold">Danger Zone</h2>
                </div>
                
                <p className="text-xs text-red-400/80 mb-6 leading-relaxed max-w-lg">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                <button 
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                    {deleting ? 'Deleting...' : 'Delete Account'} <Trash2 size={14} />
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
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowEmailModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-sm bg-[#1C1C1E] border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Decorative Shine */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,200,150,0.3)]">
                            <Mail size={32} className="text-primary" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">{t('settings.email_sent')}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            {t('settings.check_email_link')}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <Sparkles size={12} className="text-yellow-400" /> 
                            <span>Pending Confirmation</span>
                        </div>
                        
                        <button 
                            onClick={() => setShowEmailModal(false)}
                            className="mt-8 text-sm text-primary font-bold hover:text-white transition-colors uppercase tracking-wider"
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
