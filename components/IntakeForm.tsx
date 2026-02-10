import React, { useState } from 'react';
import { Button } from './ui/Button';
import { ProjectData } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface IntakeFormProps {
  initialData: ProjectData['idea'];
  onComplete: (data: ProjectData['idea']) => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ ...formData, isComplete: true });
  };

  const isFormValid = formData.description.length > 10 && 
                      formData.targetAudience.length > 3 && 
                      formData.uniqueValueProp.length > 3;

  return (
    <div className="max-w-4xl mx-auto min-h-[80vh] flex items-center">
        <div className="glass-panel p-8 md:p-16 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden w-full border border-white/60">
            {/* Background blur decorative */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-16 relative z-10">
                <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white rounded-3xl mb-8 shadow-lg shadow-indigo-100/50 transform rotate-3 border border-white">
                    <Sparkles className="h-10 w-10 text-indigo-600" />
                </div>
                <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4 text-depth">Start Your Journey</h2>
                <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto">Tell us about your startup idea, and we'll help you build it.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="md:col-span-2 space-y-3 group">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest pl-1 group-hover:text-indigo-600 transition-colors">
                            What problem are you solving?
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g. A mobile app that connects local chefs with people who want home-cooked meals..."
                            className="w-full h-36 p-6 rounded-3xl border-2 border-transparent bg-white/60 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all resize-none text-slate-800 placeholder-slate-400 text-lg outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-3 group">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest pl-1 group-hover:text-purple-600 transition-colors">
                            Target Audience
                        </label>
                        <textarea
                            name="targetAudience"
                            value={formData.targetAudience}
                            onChange={handleChange}
                            placeholder="e.g. Busy professionals aged 25-40..."
                            className="w-full h-32 p-6 rounded-3xl border-2 border-transparent bg-white/60 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:border-purple-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)] transition-all resize-none text-slate-800 placeholder-slate-400 text-base outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-3 group">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest pl-1 group-hover:text-pink-600 transition-colors">
                            Unique Value Prop
                        </label>
                        <textarea
                            name="uniqueValueProp"
                            value={formData.uniqueValueProp}
                            onChange={handleChange}
                            placeholder="e.g. Authentic cultural cuisines..."
                            className="w-full h-32 p-6 rounded-3xl border-2 border-transparent bg-white/60 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(236,72,153,0.1)] transition-all resize-none text-slate-800 placeholder-slate-400 text-base outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-3 group">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest pl-1 group-hover:text-emerald-600 transition-colors">
                            Industry / Niche
                        </label>
                        <input
                            type="text"
                            name="industry"
                            value={formData.industry || ''}
                            onChange={handleChange}
                            placeholder="e.g. FoodTech"
                            className="w-full p-6 rounded-full border-2 border-transparent bg-white/60 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] transition-all text-slate-800 placeholder-slate-400 outline-none"
                        />
                    </div>

                    <div className="space-y-3 group">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest pl-1 group-hover:text-cyan-600 transition-colors">
                            Budget / Timeline
                        </label>
                        <input
                            type="text"
                            name="budget"
                            value={formData.budget || ''}
                            onChange={handleChange}
                            placeholder="e.g. $5k, 3 months"
                            className="w-full p-6 rounded-full border-2 border-transparent bg-white/60 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:border-cyan-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,211,238,0.1)] transition-all text-slate-800 placeholder-slate-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-3 group">
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest pl-1 group-hover:text-orange-600 transition-colors">
                            Skills & Resources
                        </label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills || ''}
                            onChange={handleChange}
                            placeholder="e.g. I am a developer, my co-founder is a marketer..."
                            className="w-full p-6 rounded-full border-2 border-transparent bg-white/60 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus:border-orange-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] transition-all text-slate-800 placeholder-slate-400 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-8">
                    <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-20 text-xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_25px_50px_-10px_rgba(79,70,229,0.6)] transform hover:-translate-y-1 transition-transform" 
                    disabled={!isFormValid}
                    >
                    Initialize AI Co-Founder <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
};