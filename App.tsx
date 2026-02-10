
import React, { useEffect, useState } from 'react';
import { storageService } from './services/storageService';
import { Project, AppView, ProjectData } from './types';
import { IntakeForm } from './components/IntakeForm';
import { Dashboard } from './components/Dashboard';
import { NamingView } from './components/NamingView';
import { LogoView } from './components/LogoView';
import { WebsiteView } from './components/WebsiteView';
import { MarketingView } from './components/MarketingView';
import { PitchDeckView } from './components/PitchDeckView';
import { PivotView } from './components/PivotView';
import { MockupView } from './components/MockupView';
import { BoardroomView } from './components/BoardroomView';
import { FocusGroupView } from './components/FocusGroupView';
import { CompetitorView } from './components/CompetitorView';
import { CompetitorAnalysisView } from './components/CompetitorAnalysisView';
import { MentorView } from './components/MentorView';
import { GauntletView } from './components/GauntletView';
import { ChatAssistant } from './components/ChatAssistant';
import { Rocket, Plus, LayoutGrid, Trash2, Sparkles, Wand2, X, Folder } from 'lucide-react';
import { Button } from './components/ui/Button';
import { geminiService } from './services/geminiService';

export default function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<AppView>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Instant Launch Modal State
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchTopic, setLaunchTopic] = useState('');
  const [launchIndustry, setLaunchIndustry] = useState('');
  const [launchAudience, setLaunchAudience] = useState('');

  useEffect(() => {
    // 1. Load Projects
    refreshProjects();

    // 2. Load active project if exists
    const lastId = storageService.getCurrentProjectId();
    if (lastId) {
      const p = storageService.getProject(lastId);
      if (p) {
        setCurrentProject(p);
        setView(p.data.idea.isComplete ? 'dashboard' : 'intake');
      }
    }
  }, []);

  const refreshProjects = () => {
      setProjects(storageService.getProjects());
  };

  const handleCreateProject = () => {
    const p = storageService.createProject("New Project");
    refreshProjects();
    setCurrentProject(p);
    setView('intake');
  };

  const handleSelectProject = (id: string) => {
      const p = storageService.getProject(id);
      if (p) {
          storageService.setCurrentProjectId(id);
          setCurrentProject(p);
          setView(p.data.idea.isComplete ? 'dashboard' : 'intake');
      }
  };

  const handleDeleteProject = () => {
      if (!currentProject) return;
      if(window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
          storageService.deleteProject(currentProject.id);
          setCurrentProject(null);
          setView('dashboard');
          refreshProjects(); // Update the list
      }
  };

  const executeInstantLaunch = async () => {
      setShowLaunchModal(false);
      setIsGenerating(true);
      
      try {
          const ideaData = await geminiService.generateStartupIdea(launchTopic, launchIndustry, launchAudience);
          const tempName = "Stealth Startup " + Math.floor(Math.random() * 1000);
          const p = storageService.createProject(tempName);
          
          let updatedProject = storageService.updateProject(p.id, { 
              idea: { ...p.data.idea, ...ideaData, isComplete: true } 
          });

          if (!updatedProject) throw new Error("Failed to create project");
          
          setCurrentProject(updatedProject);
          refreshProjects();
          
          try {
             const plan = await geminiService.generateFullPlan(updatedProject.data.idea);
             updatedProject = storageService.updateProject(updatedProject.id, {
                 naming: { ...updatedProject.data.naming, ...plan.naming },
                 logo: { ...updatedProject.data.logo, ...plan.logo } as any,
                 website: { ...updatedProject.data.website, ...plan.website },
                 marketing: { ...updatedProject.data.marketing, ...plan.marketing }
             });
             
             if (updatedProject) {
                const newName = plan.naming.selectedName;
                if (newName && newName !== 'My Startup') {
                    const renamed = storageService.renameProject(updatedProject.id, newName);
                    if (renamed) updatedProject = renamed;
                }
                setCurrentProject(updatedProject);
                refreshProjects();
             }
          } catch (planError) {
              console.warn("Full plan generation had issues (likely quota or timeout):", planError);
          }

          setView('dashboard');

      } catch (e) {
          console.error(e);
          alert("Instant launch failed to generate an idea. Please try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleUpdateProject = (data: Partial<ProjectData>) => {
    if (!currentProject) return;
    
    const updated = storageService.updateProject(currentProject.id, data);
    if (updated) {
        setCurrentProject(updated);
        refreshProjects(); // Keep list in sync
        if (view === 'intake' && updated.data.idea.isComplete) {
            setView('dashboard');
        }
    }
  };

  const handleRenameProject = (newName: string) => {
      if (!currentProject) return;
      const updated = storageService.renameProject(currentProject.id, newName);
      if (updated) {
          setCurrentProject(updated);
          refreshProjects();
      }
  };

  const renderContent = () => {
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
                 <div className="relative">
                     <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                     <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/50 relative z-10 flex flex-col items-center">
                         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-600 mb-6"></div>
                         <h2 className="text-2xl font-bold text-slate-900 mb-2">Generating Universe...</h2>
                         <p className="text-slate-500 text-sm">Crafting idea, name, logo, site, and strategy.</p>
                         <p className="text-xs text-slate-400 mt-4 max-w-xs animate-pulse">This may take up to 30 seconds...</p>
                     </div>
                 </div>
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 space-y-12">
                <div className="glass-panel p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full transform hover:scale-[1.01] transition-transform duration-500">
                    <div className="bg-gradient-to-tr from-indigo-100 to-white p-6 rounded-full inline-flex mb-8 shadow-inner">
                        <Rocket className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">LaunchPad AI</h1>
                    <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">Your 5D co-founder. Turn your idea into a launch-ready brand in minutes.</p>
                    <div className="grid grid-cols-1 gap-4 w-full">
                        <Button onClick={handleCreateProject} size="lg" className="h-14 text-lg shadow-lg">
                            <Plus className="h-5 w-5 mr-2" /> Start New Project
                        </Button>
                        <Button onClick={() => setShowLaunchModal(true)} size="lg" variant="secondary" className="h-14 text-lg shadow-lg border-2 border-indigo-100 bg-white/80 hover:bg-white text-indigo-700">
                            <Sparkles className="h-5 w-5 mr-2" /> AI Startup Generator
                        </Button>
                    </div>
                </div>

                {/* Project List */}
                {projects.length > 0 && (
                    <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Your Projects</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => handleSelectProject(p.id)}
                                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Folder className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">{p.name}</h4>
                                            <p className="text-xs text-slate-400">Last updated {new Date(p.lastUpdated).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all z-20 relative"
                                        title="Delete Project"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if(window.confirm(`Delete ${p.name}?`)) {
                                                storageService.deleteProject(p.id);
                                                refreshProjects();
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Force re-render of components when project ID changes using key prop
    const commonProps = {
        key: currentProject.id,
        project: currentProject,
        onUpdate: (d: Partial<ProjectData>) => handleUpdateProject({ ...currentProject.data, ...d }),
        onBack: () => setView('dashboard')
    };

    if (view === 'intake') {
        return <IntakeForm key={currentProject.id} initialData={currentProject.data.idea} onComplete={(idea) => handleUpdateProject({ idea })} />;
    }

    switch (view) {
        case 'dashboard':
            return <Dashboard 
                      key={currentProject.id}
                      project={currentProject} 
                      onChangeView={setView} 
                      onRename={handleRenameProject}
                      onUpdateProject={(d) => handleUpdateProject({ ...currentProject.data, ...d })}
                      onLaunchAI={() => setShowLaunchModal(true)}
                   />;
        case 'naming':
            return <NamingView {...commonProps} />;
        case 'logo':
            return <LogoView {...commonProps} />;
        case 'website':
            return <WebsiteView {...commonProps} />;
        case 'marketing':
            return <MarketingView {...commonProps} />;
        case 'pitch-deck':
            return <PitchDeckView {...commonProps} />;
        case 'pivot':
            return <PivotView {...commonProps} />;
        case 'mockup':
            return <MockupView {...commonProps} />;
        case 'boardroom':
            return <BoardroomView {...commonProps} />;
        case 'focus-group':
            return <FocusGroupView {...commonProps} />;
        case 'competitor':
            return <CompetitorView {...commonProps} />;
        case 'competitor-analysis':
            return <CompetitorAnalysisView {...commonProps} />;
        case 'mentor':
            return <MentorView {...commonProps} />;
        case 'gauntlet':
            return <GauntletView {...commonProps} />;
        default:
            return <Dashboard 
                      key={currentProject.id}
                      project={currentProject} 
                      onChangeView={setView} 
                      onRename={handleRenameProject}
                      onUpdateProject={(d) => handleUpdateProject({ ...currentProject.data, ...d })}
                      onLaunchAI={() => setShowLaunchModal(true)}
                   />;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-10">
      <nav className="sticky top-6 z-50 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
            <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-lg shadow-indigo-900/5">
                <div 
                    className="flex items-center cursor-pointer group" 
                    onClick={() => currentProject && setView('dashboard')}
                >
                    <div className="bg-indigo-600 text-white p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/30">
                        <Rocket className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-indigo-700 transition-colors">LaunchPad AI</span>
                </div>
                {currentProject && (
                    <div className="flex items-center gap-3">
                         {view !== 'dashboard' && (
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hidden md:flex rounded-full mr-2"
                                onClick={() => setView('dashboard')}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" /> Dashboard
                            </Button>
                         )}
                        
                        {/* New "My Projects" button to go back to list easily */}
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCurrentProject(null)} 
                            className="hidden sm:flex text-slate-500 hover:text-indigo-600"
                        >
                            <Folder className="h-4 w-4 mr-2" /> My Projects
                        </Button>

                        <div className="h-6 w-px bg-slate-200 mx-2"></div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleDeleteProject}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full px-4"
                            title="Delete Project"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-[fadeIn_0.5s_ease-out]">
            {renderContent()}
        </div>
      </main>
      
      {/* Floating Assistant - Always available if we have an active project or even if not */}
      <ChatAssistant currentProject={currentProject} />

      {/* Instant Launch Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowLaunchModal(false)}></div>
            <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative z-10 animate-[scaleIn_0.2s_ease-out]">
                <button 
                    onClick={() => setShowLaunchModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">AI Startup Generator</h3>
                <p className="text-center text-slate-500 mb-6">Describe your idea, or just a topic, and we'll build the foundation.</p>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Core Topic / Problem</label>
                        <input
                            type="text"
                            value={launchTopic}
                            onChange={(e) => setLaunchTopic(e.target.value)}
                            placeholder="e.g. Sustainable Coffee, VR Fitness..."
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none bg-slate-50 focus:bg-white transition-all"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Industry (Optional)</label>
                        <input
                            type="text"
                            value={launchIndustry}
                            onChange={(e) => setLaunchIndustry(e.target.value)}
                            placeholder="e.g. HealthTech, SaaS, Retail..."
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Audience (Optional)</label>
                        <input
                            type="text"
                            value={launchAudience}
                            onChange={(e) => setLaunchAudience(e.target.value)}
                            placeholder="e.g. Busy moms, College students..."
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && executeInstantLaunch()}
                        />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <Button 
                        onClick={executeInstantLaunch} 
                        size="lg" 
                        className="w-full"
                    >
                        Generate Foundation
                    </Button>
                </div>
                <div className="mt-4 text-center">
                    <button onClick={executeInstantLaunch} className="text-xs text-slate-400 hover:text-indigo-600 font-medium">
                        I'm feeling lucky (Random Idea)
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
