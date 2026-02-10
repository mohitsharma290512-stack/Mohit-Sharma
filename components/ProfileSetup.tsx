
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './ui/Button';
import { User, Briefcase, Sparkles } from 'lucide-react';

interface ProfileSetupProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        onComplete({
            ...user,
            role,
            bio
        });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 max-w-lg w-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="text-center mb-8">
             <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             </div>
             <h2 className="text-2xl font-bold text-slate-900">Complete Your Profile</h2>
             <p className="text-slate-500">Tell us a bit about yourself, {user.name.split(' ')[0]}.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">What's your primary role?</label>
                 <div className="grid grid-cols-2 gap-3">
                     {['Founder', 'Developer', 'Designer', 'Marketer', 'Investor', 'Student'].map((r) => (
                         <div 
                            key={r}
                            onClick={() => setRole(r)}
                            className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${role === r ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                         >
                             <span className="text-sm font-medium">{r}</span>
                         </div>
                     ))}
                 </div>
             </div>

             <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Short Bio (Optional)</label>
                 <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="I'm building the next big thing in AI..."
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none bg-white h-24 resize-none transition-all"
                 />
             </div>

             <Button 
                type="submit" 
                className="w-full h-14 text-lg"
                disabled={!role || loading}
                isLoading={loading}
             >
                 {loading ? 'Creating Profile...' : 'Complete Setup'}
             </Button>
         </form>
      </div>
    </div>
  );
};
