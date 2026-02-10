
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Rocket } from 'lucide-react';
import { UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthViewProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  // Simulated Google Login
  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const mockUser: UserProfile = {
        id: uuidv4(),
        name: 'Demo Founder',
        email: 'founder@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        isVerified: true
      };
      setLoading(false);
      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 max-w-md w-full text-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
            <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30 transform rotate-3">
                <Rocket className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome to LaunchPad</h1>
            <p className="text-slate-500 mb-8">Your AI Co-Founder awaits. Sign in to start building your empire.</p>

            <div className="space-y-4">
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-medium py-3.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="space-y-3">
                    <input 
                        type="email" 
                        placeholder="Email address" 
                        disabled
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm focus:outline-none cursor-not-allowed"
                    />
                    <Button disabled className="w-full bg-slate-800 hover:bg-slate-700 cursor-not-allowed opacity-50">
                        Sign In with Email
                    </Button>
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
      </div>
    </div>
  );
};
