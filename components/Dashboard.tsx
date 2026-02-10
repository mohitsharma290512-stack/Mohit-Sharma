
import React, { useState, useEffect } from 'react';
import { Project, AppView, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { 
  Rocket, 
  Type, 
  Palette, 
  Monitor, 
  Megaphone, 
  Presentation,
  CheckCircle2, 
  Circle,
  Pencil,
  Lightbulb,
  MonitorPlay,
  Zap,
  Award,
  Sparkles,
  ArrowRight,
  Wand2,
  Users,
  MessageCircle,
  Swords,
  Search,
  Check,
  GraduationCap,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  project: Project;
  onChangeView: (view: AppView) => void;
  onRename: (newName: string) => void;
  onUpdateProject?: (data: Partial<ProjectData>) => void; // Added for magic build
  onLaunchAI: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ project, onChangeView, onRename, onUpdateProject, onLaunchAI }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [badges, setBadges] = useState<string[]>(project.data.badges || []);
  const [isMagicBuilding, setIsMagicBuilding] = useState(false);

  useEffect(() => {
    setName(project.name);
    calculateBadges();
  }, [project]);

  const calculateBadges = () => {
      const b: string[] = [];
      if (project.data.idea.isComplete) b.push('Visionary');
      if (project.data.naming.selectedName) b.push('Named');
      if (project.data.logo.imageUrl) b.push('Branded');
      if (project.data.website.sitemap) b.push('Webmaster');
      if (project.data.marketing.strategy) b.push('Strategist');
      if (b.length >= 5) b.push('Founder Mode');
      setBadges(b);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (name.trim() && name !== project.name) {
        onRename(name);
    } else {
        setName(project.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleBlur();
      }
  };

  const handleMagicBuild = async () => {
      if (!onUpdateProject) return;
      setIsMagicBuilding(true);
      try {
          const plan = await geminiService.generateFullPlan(project.data.idea);
          onUpdateProject({
              naming: { ...project.data.naming, ...plan.naming },
              logo: { ...project.data.logo, ...plan.logo } as any,
              website: { ...project.data.website, ...plan.website },
              marketing: { ...project.data.marketing, ...plan.marketing }
          });
      } catch (e) {
          console.error(e);
          alert("Magic Build failed. Please try again.");
      } finally {
          setIsMagicBuilding(false);
      }
  };

  // Explicit roadmap stages as requested
  const roadmapSteps = [
    { id: 'idea', label: 'Idea', isComplete: project.data.idea.isComplete, view: 'intake' as const },
    { id: 'naming', label: 'Naming', isComplete: !!project.data.naming.selectedName, view: 'naming' as const },
    { id: 'logo', label: 'Logo', isComplete: !!project.data.logo.imageUrl, view: 'logo' as const },
    { id: 'website', label: 'Website', isComplete: !!project.data.website.sitemap, view: 'website' as const },
    { id: 'marketing', label: 'Marketing', isComplete: !!project.data.marketing.strategy, view: 'marketing' as const },
    { id: 'pitch-deck', label: 'Pitch Deck', isComplete: !!(project.data.pitchDeck?.slides?.length > 0), view: 'pitch-deck' as const },
  ];

  const steps = [
    {
      id: 'naming' as const,
      title: 'Naming',
      description: 'Generate catchy business names and check availability.',
      icon: Type,
      isComplete: !!project.data.naming.selectedName,
      color: 'text-blue-600 bg-blue-50/80 border-blue-100',
    },
    {
      id: 'logo' as const,
      title: 'Logo Design',
      description: 'Create unique visual identities and logo concepts.',
      icon: Palette,
      isComplete: !!project.data.logo.imageUrl,
      color: 'text-purple-600 bg-purple-50/80 border-purple-100',
    },
    {
      id: 'website' as const,
      title: 'Website Plan',
      description: 'Get a sitemap, hero copy, and color palette.',
      icon: Monitor,
      isComplete: !!project.data.website.sitemap,
      color: 'text-emerald-600 bg-emerald-50/80 border-emerald-100',
    },
    {
      id: 'mockup' as const,
      title: 'Instant Mockup',
      description: 'Visualize your landing page with a live HTML preview.',
      icon: MonitorPlay,
      isComplete: !!project.data.mockup?.html,
      color: 'text-cyan-600 bg-cyan-50/80 border-cyan-100',
    },
    {
      id: 'marketing' as const,
      title: 'Marketing',
      description: 'Strategy and social media posts to get your first users.',
      icon: Megaphone,
      isComplete: !!project.data.marketing.strategy,
      color: 'text-orange-600 bg-orange-50/80 border-orange-100',
    },
    {
      id: 'pitch-deck' as const,
      title: 'Pitch Deck',
      description: 'Generate an investor-ready slide deck outline.',
      icon: Presentation,
      isComplete: !!(project.data.pitchDeck?.slides?.length > 0),
      color: 'text-pink-600 bg-pink-50/80 border-pink-100',
    },
    {
      id: 'mentor' as const,
      title: 'Founder School',
      description: 'Talk to your AI Mentor to learn and refine your idea.',
      icon: GraduationCap,
      isComplete: !!(project.data.mentor?.messages?.length > 0),
      color: 'text-violet-600 bg-violet-50/80 border-violet-100',
    },
    {
      id: 'boardroom' as const,
      title: 'The Boardroom',
      description: 'Get advice from 3 AI personas: Visionary, Growth Hacker, & Skeptic.',
      icon: Users,
      isComplete: !!(project.data.boardroom?.history?.length > 0),
      color: 'text-indigo-600 bg-indigo-50/80 border-indigo-100',
    },
    {
      id: 'focus-group' as const,
      title: 'Focus Group',
      description: 'Recruit AI agents matching your audience and interview them.',
      icon: MessageCircle,
      isComplete: !!(project.data.focusGroup?.history?.length > 0),
      color: 'text-teal-600 bg-teal-50/80 border-teal-100',
    },
    {
      id: 'competitor-analysis' as const,
      title: 'Competitor Intel',
      description: 'Analyze key competitors, strengths, weaknesses, and market gaps.',
      icon: Search,
      isComplete: !!(project.data.competitorAnalysis?.competitors?.length > 0),
      color: 'text-blue-500 bg-blue-50/80 border-blue-100',
    },
    {
      id: 'competitor' as const,
      title: 'Competitor Wargames',
      description: 'Face off against an AI Nemesis in a strategy simulation.',
      icon: Swords,
      isComplete: !!project.data.competitor?.nemesis,
      color: 'text-red-600 bg-red-50/80 border-red-100',
    },
    {
      id: 'gauntlet' as const,
      title: 'The Gauntlet',
      description: 'Pitch to AI VCs in a high-stakes simulation to win funding.',
      icon: Briefcase,
      isComplete: project.data.gauntlet?.status === 'funded',
      color: 'text-rose-700 bg-rose-50/80 border-rose-100',
    },
    {
      id: 'pivot' as const,
      title: 'Surprise Pivot',
      description: 'Spark inspiration with AI-generated business pivots.',
      icon: Lightbulb,
      isComplete: false, // Always available
      color: 'text-yellow-600 bg-yellow-50/80 border-yellow-100',
    },
  ];

  const completedCount = steps.filter(s => s.isComplete && !['pivot', 'boardroom', 'focus-group', 'competitor', 'competitor-analysis', 'mentor', 'gauntlet'].includes(s.id)).length;
  // totalSteps calculation excludes optional/ongoing tools like pivot/boardroom/focus/competitor/mentor/gauntlet for progress tracking
  const totalSteps = 6; 
  const progress = Math.min(100, Math.round((completedCount / totalSteps) * 100));

  return (
    <div className="space-y-12">
      {/* Header Section - Floating Hologram Style */}
      <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden transition-all duration-700 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)]">
        
        {/* Deep Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-[400px] h-[400px] bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full mix-blend-multiply filter blur-[60px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-grow space-y-4">
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 bg-transparent border-b-2 border-indigo-400 focus:outline-none w-full max-w-lg tracking-tight pb-2"
                        />
                    ) : (
                        <div 
                            onClick={() => setIsEditing(true)}
                            className="group flex items-center gap-4 cursor-pointer"
                        >
                            <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight text-depth group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 transition-all">
                                {project.name}
                            </h1>
                            <div className="p-2 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 transition-all shadow-sm transform group-hover:scale-110">
                                <Pencil className="h-5 w-5 text-indigo-500" />
                            </div>
                        </div>
                    )}
                </div>
                
                <p className="text-slate-500 font-medium flex items-center gap-2 text-lg">
                    <span className="bg-indigo-100/50 p-1.5 rounded-md"><Rocket className="h-4 w-4 text-indigo-600" /></span> 
                    <span className="opacity-80">LaunchPad AI • Last updated {new Date(project.lastUpdated).toLocaleDateString()}</span>
                </p>
                
                {/* 3D Badges */}
                <div className="flex flex-wrap gap-3 pt-2">
                    {badges.map(b => (
                        <span key={b} className="relative overflow-hidden inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-yellow-700 bg-gradient-to-b from-yellow-50 to-yellow-100/50 border border-yellow-200/50 shadow-[0_4px_10px_-2px_rgba(234,179,8,0.2)] hover:-translate-y-0.5 transition-transform">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]"></span>
                            <Award className="h-3 w-3 mr-2 text-yellow-600" /> {b}
                        </span>
                    ))}
                    {badges.length === 0 && <span className="text-sm text-slate-400 italic font-medium px-2 py-1">Complete tasks to earn badges</span>}
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-6 min-w-[280px]">
                {/* New Button to trigger AI Generator */}
                <Button 
                    onClick={onLaunchAI} 
                    variant="secondary"
                    className="w-full bg-white text-indigo-600 border border-indigo-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
                >
                    <Sparkles className="h-4 w-4 mr-2" /> New AI Startup
                </Button>

                {onUpdateProject && progress < 100 && (
                     <Button 
                        onClick={handleMagicBuild} 
                        isLoading={isMagicBuilding}
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_10px_30px_-10px_rgba(192,38,211,0.5)] border-t border-white/20"
                     >
                        <Wand2 className="h-4 w-4 mr-2 animate-pulse" /> One-Click Launch Plan
                     </Button>
                )}

                <div className="text-right w-full bg-white/40 p-5 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Launch Readiness</span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full relative shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Roadmap / Progress Tracker */}
      <div className="glass-panel p-8 rounded-[2rem] border-white/60 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-indigo-600" /> Startup Roadmap
            </h3>
            <span className="text-sm font-medium text-slate-500">Step {roadmapSteps.filter(s => s.isComplete).length} of {roadmapSteps.length}</span>
        </div>
        
        <div className="relative z-10 px-4">
            {/* Connecting Line Base */}
            <div className="absolute top-[26px] left-0 w-full h-1 bg-slate-200 rounded-full z-0"></div>
            
            {/* Connecting Line Active */}
            <div 
                className="absolute top-[26px] left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full z-0 transition-all duration-1000"
                style={{ width: `${(roadmapSteps.filter(s => s.isComplete).length / (roadmapSteps.length - 1)) * 100}%` }}
            ></div>

            <div className="relative z-10 flex justify-between w-full">
                {roadmapSteps.map((step, idx) => {
                    const isCompleted = step.isComplete;
                    const isNext = !isCompleted && (idx === 0 || roadmapSteps[idx - 1].isComplete);
                    const isFuture = !isCompleted && !isNext;

                    return (
                        <div 
                            key={step.id} 
                            onClick={() => {
                                // Allow navigation if completed or is next
                                if (isCompleted || isNext) {
                                    if(step.view === 'intake') {
                                        // Usually we prefer not to go back to intake unless user wants to edit idea
                                        onChangeView(step.view as AppView);
                                    } else {
                                        onChangeView(step.view as AppView); 
                                    }
                                }
                            }}
                            className={`flex flex-col items-center gap-3 cursor-pointer group w-24 relative ${isFuture ? 'cursor-not-allowed' : ''}`}
                        >
                            <div className={`
                                w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm relative z-10
                                ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-indigo-200' : 
                                  isNext ? 'bg-white border-indigo-500 text-indigo-600 ring-4 ring-indigo-100 scale-105' : 
                                  'bg-slate-100 border-slate-200 text-slate-300'}
                            `}>
                                {isCompleted ? <Check className="h-6 w-6" /> : <span className="text-lg font-bold">{idx + 1}</span>}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wide text-center transition-colors absolute top-16 w-32 ${isCompleted || isNext ? 'text-indigo-900 opacity-100' : 'text-slate-400 opacity-70'}`}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
        
        {/* Padding for labels */}
        <div className="h-8"></div>
      </div>

      {/* Grid of Steps - Hyper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const isOngoing = ['pivot', 'boardroom', 'focus-group', 'competitor', 'competitor-analysis', 'mentor', 'gauntlet'].includes(step.id);
          return (
            <div 
              key={step.id}
              className={`
                hyper-card group glass-panel rounded-[2rem] p-8 cursor-pointer relative overflow-hidden flex flex-col min-h-[280px]
                ${step.isComplete ? 'border-emerald-400/30' : ''}
              `}
              onClick={() => onChangeView(step.id)}
            >
              {/* Status Indicator Bubble */}
              <div className="absolute top-6 right-6 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 z-20">
                {step.isComplete ? (
                    <div className="bg-emerald-100/80 backdrop-blur text-emerald-600 p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-200">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                ) : (
                    !isOngoing && <Circle className="h-6 w-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                )}
              </div>
              
              {/* Icon Container with Glow */}
              <div className={`
                relative z-10 inline-flex p-5 rounded-2xl mb-6 w-fit transition-all duration-500 
                ${step.color} border shadow-inner group-hover:scale-110 group-hover:rotate-[-5deg]
              `}>
                <Icon className="h-8 w-8 relative z-10" />
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <h3 className="relative z-10 text-2xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="relative z-10 text-slate-500 text-base leading-relaxed flex-grow font-medium">
                {step.description}
              </p>
              
              {/* Footer Action */}
              <div className="relative z-10 mt-6 pt-6 border-t border-slate-100/50 flex items-center text-indigo-600 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                <span className="bg-indigo-50/50 px-3 py-1 rounded-lg group-hover:bg-indigo-100/50 transition-colors flex items-center">
                    {step.isComplete ? 'Review Details' : (isOngoing ? 'Open Tool' : 'Start Task')} <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

        {/* Quick Summary - Floating Panel */}
        <div className="glass-panel p-10 rounded-[2.5rem] relative mb-12 transform hover:scale-[1.01] transition-transform duration-500 border-white/60">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-yellow-500" /> Project Blueprint
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-3 relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="block text-xs font-bold text-indigo-500 uppercase tracking-wider">Concept</span>
                    <p className="text-slate-700 text-lg leading-relaxed font-medium">{project.data.idea.description}</p>
                </div>
                <div className="space-y-3 relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="block text-xs font-bold text-purple-500 uppercase tracking-wider">Audience</span>
                    <p className="text-slate-700 text-lg leading-relaxed font-medium">{project.data.idea.targetAudience}</p>
                </div>
                <div className="space-y-3 relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="block text-xs font-bold text-pink-500 uppercase tracking-wider">Industry</span>
                    <p className="text-slate-700 text-lg leading-relaxed font-medium">{project.data.idea.industry || 'Not specified'}</p>
                </div>
            </div>
        </div>
    </div>
  );
};
