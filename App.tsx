
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { Wizard } from './components/Wizard';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { Dashboard } from './components/Dashboard';
import { Subscription } from './components/Subscription';
import { Payment } from './components/Payment';
import { Settings } from './components/Settings';
import { UpdatePassword } from './components/UpdatePassword';
import { TermsOfService } from './components/TermsOfService';
import { FAQ } from './components/FAQ';
import { LoadingScreen } from './components/LoadingScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { User, SavedSession } from './types';
import { supabase } from './utils/supabaseClient';

type View = 'landing' | 'login' | 'register' | 'forgot-password' | 'dashboard' | 'wizard' | 'subscription' | 'payment' | 'settings' | 'update-password' | 'terms' | 'faq';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, upgradeSubscription } = useAuth();
  
  // Local view state handles navigation within the auth/unauth worlds
  const [view, setView] = useState<View>('landing');
  const [previousView, setPreviousView] = useState<View>('landing');
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');

  // Sync view with Auth State
  useEffect(() => {
    // Listener for Password Recovery Flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
            setView('update-password');
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) {
        if (isAuthenticated) {
            // If user just logged in or is logged in, show dashboard (unless already inside wizard/sub/settings/update-pass/terms/faq)
            if (['landing', 'login', 'register', 'forgot-password'].includes(view)) {
                setView('dashboard');
            }
        } else {
            // If user is not logged in, ensure they can't see protected views
            // ALLOW subscription, terms, faq view for public
            if (['dashboard', 'wizard', 'settings', 'payment', 'update-password'].includes(view)) {
                setView('landing');
            }
        }
    }
  }, [isAuthenticated, isLoading, view]);

  if (isLoading) {
      return <LoadingScreen />;
  }

  const goToSubscription = () => {
    setPreviousView(view);
    setView('subscription');
  };

  const handleBackFromSubscription = () => {
    setView(previousView);
  };

  const handleProceedToPayment = (plan: 'monthly' | 'lifetime') => {
      setSelectedPlan(plan);
      setView('payment');
  };

  const handleBackFromPayment = () => {
      setView('subscription');
  };

  const handlePaymentSuccess = async () => {
    try {
        await upgradeSubscription();
        setTimeout(() => setView('dashboard'), 2000);
    } catch (e) {
        throw e; // Pass error back to component
    }
  };

  const handleStartSession = () => {
    setSelectedSession(null);
    setView('wizard');
  };

  const handleEditSession = (session: SavedSession) => {
    setSelectedSession(session);
    setView('wizard');
  };

  const handleExitWizard = () => {
    setSelectedSession(null);
    setView('dashboard');
  };

  const goToSettings = () => {
    setPreviousView(view);
    setView('settings');
  }

  const handleBackFromSettings = () => {
    setView('dashboard');
  }

  const handleGoToTerms = () => {
    setPreviousView(view);
    setView('terms');
  }

  const handleBackFromTerms = () => {
      setView(previousView);
  }

  const handleGoToFAQ = () => {
      setPreviousView(view);
      setView('faq');
  }

  const handleBackFromFAQ = () => {
      setView(previousView);
  }

  return (
    <div className="antialiased text-gray-900 dark:text-gray-100 bg-[#F9FAFB] dark:bg-[#000000] min-h-screen font-sans selection:bg-primary/30 selection:text-white transition-colors duration-500 relative flex flex-col">
      <div className="flex-1">
        <AnimatePresence mode="wait">
            
            {/* Public Routes */}
            {!isAuthenticated && view === 'landing' && (
                <Landing 
                    key="landing" 
                    onEnter={() => setView('login')} 
                    onPricing={goToSubscription} 
                    onTerms={handleGoToTerms}
                    onFAQ={handleGoToFAQ}
                />
            )}
            {!isAuthenticated && view === 'login' && (
                <Login 
                    key="login" 
                    onRegister={() => setView('register')}
                    onForgotPassword={() => setView('forgot-password')}
                    onBack={() => setView('landing')}
                />
            )}
            {!isAuthenticated && view === 'register' && (
                <Register 
                    key="register" 
                    onLogin={() => setView('login')}
                    onBack={() => setView('landing')}
                />
            )}
            {!isAuthenticated && view === 'forgot-password' && (
                <ForgotPassword 
                    key="forgot-password" 
                    onBack={() => setView('login')} 
                />
            )}

            {/* Protected Routes */}
            {isAuthenticated && view === 'dashboard' && (
                <Dashboard 
                    key="dashboard" 
                    onStartSession={handleStartSession} 
                    onUpgrade={goToSubscription}
                    onEditSession={handleEditSession}
                    onSettings={goToSettings}
                />
            )}
            {isAuthenticated && view === 'wizard' && (
                <Wizard 
                    key="wizard" 
                    onExit={handleExitWizard} 
                    isPro={user?.isPro || false} 
                    existingSession={selectedSession}
                />
            )}
            {isAuthenticated && view === 'settings' && (
                <Settings 
                    key="settings"
                    onBack={handleBackFromSettings}
                />
            )}
            {isAuthenticated && view === 'payment' && (
                <Payment 
                    key="payment"
                    onBack={handleBackFromPayment}
                    onSuccess={handlePaymentSuccess}
                    plan={selectedPlan}
                />
            )}
            {isAuthenticated && view === 'update-password' && (
                <UpdatePassword
                    key="update-password"
                    onSuccess={() => setView('dashboard')}
                />
            )}
            
            {/* Shared Route */}
            {view === 'subscription' && (
                <Subscription 
                    key="subscription" 
                    onBack={handleBackFromSubscription}
                    onProceed={handleProceedToPayment}
                    isAuthenticated={isAuthenticated}
                    onLoginRequest={() => setView('login')}
                />
            )}
            {view === 'terms' && (
                <TermsOfService 
                    key="terms"
                    onBack={handleBackFromTerms}
                />
            )}
            {view === 'faq' && (
                <FAQ 
                    key="faq"
                    onBack={handleBackFromFAQ}
                />
            )}
        </AnimatePresence>
      </div>
      
      {/* Global Footer (Visible when not in Landing, as Landing has its own internal footer) */}
      {view !== 'landing' && (
        <footer className="w-full py-8 flex justify-center pointer-events-none relative z-40">
            <div className="pointer-events-auto flex items-center gap-4">
                
                {/* Support Link */}
                <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1C1C1E]/80 border border-white/20 dark:border-white/5 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                            Support
                        </span>
                    </div>
                    <div className="h-3 w-px bg-gray-300 dark:bg-gray-700"></div>
                    <a href="mailto:support@auraplot.site" className="text-[11px] font-bold text-gray-800 dark:text-white hover:text-primary dark:hover:text-primary transition-colors select-text font-mono">
                        support@auraplot.site
                    </a>
                </div>

                {/* FAQ Link */}
                <button 
                    onClick={handleGoToFAQ}
                    className="backdrop-blur-2xl bg-white/70 dark:bg-[#1C1C1E]/80 border border-white/20 dark:border-white/5 px-5 py-3 rounded-full shadow-2xl text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-white dark:hover:bg-[#2C2C2E] hover:text-gray-800 dark:hover:text-white transition-all duration-300 hover:scale-105"
                >
                    FAQ
                </button>

                {/* Terms Link */}
                <button 
                    onClick={handleGoToTerms}
                    className="backdrop-blur-2xl bg-white/70 dark:bg-[#1C1C1E]/80 border border-white/20 dark:border-white/5 px-5 py-3 rounded-full shadow-2xl text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-white dark:hover:bg-[#2C2C2E] hover:text-gray-800 dark:hover:text-white transition-all duration-300 hover:scale-105"
                >
                    Terms
                </button>

            </div>
        </footer>
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
        <LanguageProvider>
            <AuthProvider>
                <AppContent />
                <Analytics />
            </AuthProvider>
        </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
