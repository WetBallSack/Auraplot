import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Database, Key, Save, AlertCircle } from 'lucide-react';
import { saveSupabaseConfig } from '../utils/supabaseClient';

export const SupabaseSetup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
        saveSupabaseConfig(url, key);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="text-primary mb-4">
                    <Logo className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold text-white text-center">Connect Database</h1>
                <p className="text-gray-400 text-sm text-center mt-2">
                    To enable client-server features, connect your Supabase project.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Database size={12} /> Project URL
                    </label>
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co" 
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white font-mono"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Key size={12} /> API Key (Anon/Public)
                    </label>
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5..." 
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white font-mono"
                        required
                    />
                </div>

                <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl text-xs text-blue-200 leading-relaxed flex gap-3">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                        <strong>Where to find these?</strong><br/>
                        Supabase Dashboard &rarr; Project Settings &rarr; API.
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    Connect & Reload
                </button>
            </form>
        </motion.div>
    </div>
  );
};