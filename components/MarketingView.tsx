
import React, { useState } from 'react';
import { Project, ProjectData, Campaign, CampaignConcept } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Share2, CheckSquare, Sparkles, Megaphone, Calendar, Users, Rocket, Target, Plus, Mail, Zap, BrainCircuit, ArrowRight, Lightbulb, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

interface MarketingViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [generatingCampaign, setGeneratingCampaign] = useState<string | null>(null);
  const [customType, setCustomType] = useState('');
  const [brainstormMode, setBrainstormMode] = useState(false);
  // Local state for current brainstorm session results
  const [currentConcepts, setCurrentConcepts] = useState<CampaignConcept[]>([]);
  const [selectedConceptType, setSelectedConceptType] = useState('');

  const { strategy, socialPosts, checklist, campaigns, concepts: savedConcepts } = project.data.marketing;

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const nameToUse = project.data.naming.selectedName || "My Startup";
        const result = await geminiService.generateMarketing(project.data.idea, nameToUse);
        onUpdate({
            marketing: {
                ...project.data.marketing,
                strategy: result.strategy,
                socialPosts: result.socialPosts,
                checklist: result.checklist || [],
            }
        });
    } catch (e) {
        console.error(e);
        alert("Error generating strategy.");
    } finally {
        setLoading(false);
    }
  };

  const handleCampaignAction = async (type: string) => {
      if (!type.trim()) return;
      
      if (brainstormMode) {
          await handleBrainstorm(type);
      } else {
          await handleCreateCampaign(type);
      }
  };

  const handleBrainstorm = async (type: string) => {
      setGeneratingCampaign(type);
      setSelectedConceptType(type);
      setCurrentConcepts([]);
      try {
          const result = await geminiService.brainstormCampaigns(project.data.idea, type);
          const newConcepts: CampaignConcept[] = result.concepts.map((c: any) => ({
              id: uuidv4(),
              type: type,
              title: c.title,
              description: c.description,
              impact: c.impact
          }));
          setCurrentConcepts(newConcepts);
      } catch (e) {
          console.error(e);
          alert("Failed to brainstorm concepts.");
      } finally {
          setGeneratingCampaign(null);
      }
  };

  const handleSaveConcept = (concept: CampaignConcept) => {
      const updatedConcepts = [...(savedConcepts || []), concept];
      onUpdate({
          marketing: {
              ...project.data.marketing,
              concepts: updatedConcepts
          }
      });
      // Remove from current view to indicate action taken? Or keep it. Let's keep it but show saved status if possible.
      // For simplicity, just remove from current list or let it stay.
  };

  const handleDeleteConcept = (id: string) => {
      const updatedConcepts = (savedConcepts || []).filter(c => c.id !== id);
      onUpdate({
          marketing: {
              ...project.data.marketing,
              concepts: updatedConcepts
          }
      });
  };

  const handleCreateCampaign = async (type: string, specificConcept?: string) => {
      if (!type.trim()) return;
      setGeneratingCampaign(type);
      try {
          const nameToUse = project.data.naming.selectedName || "My Startup";
          const result = await geminiService.generateCampaign(project.data.idea, nameToUse, type, specificConcept);
          
          const newCampaign: Campaign = {
              id: uuidv4(),
              type,
              ...result
          };

          const currentCampaigns = project.data.marketing.campaigns || [];
          onUpdate({
              marketing: {
                  ...project.data.marketing,
                  campaigns: [...currentCampaigns, newCampaign]
              }
          });
          
          // Reset brainstorm state if we used it from there
          if (specificConcept) {
              setCurrentConcepts([]);
              setSelectedConceptType('');
          }
          setCustomType('');
      } catch (e) {
          console.error(e);
          alert("Failed to generate campaign.");
      } finally {
          setGeneratingCampaign(null);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Marketing Strategy</h2>
        </div>
        <Button onClick={handleGenerate} isLoading={loading}>
            {strategy ? 'Regenerate Base Strategy' : 'Generate Strategy'}
        </Button>
      </div>

      {!strategy ? (
          <div className="bg-white p-16 rounded-[2.5rem] border border-slate-200 text-center shadow-lg hover:shadow-xl transition-all duration-500">
             <div className="bg-orange-50 p-6 rounded-full inline-flex mb-6">
                 <Megaphone className="h-12 w-12 text-orange-500" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Go To Market</h3>
             <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg">
                Generate a comprehensive launch strategy, social media content calendar, and execution checklist tailored to your audience.
             </p>
             <Button onClick={handleGenerate} isLoading={loading} size="lg" className="px-10 h-14 text-lg">
                Generate Marketing Plan
             </Button>
          </div>
      ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Strategy Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-600" /> High-Level Strategy
                </h3>
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600">
                    <ReactMarkdown>{strategy}</ReactMarkdown>
                </div>
            </div>

            {/* Campaign Lab */}
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden transition-all">
                 <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                 
                 <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                             <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Sparkles className="h-6 w-6 text-purple-400" />
                             </div>
                             <div>
                                <h3 className="text-xl font-bold text-white">Campaign Lab</h3>
                                <p className="text-slate-400 text-sm">Generate actionable plans or brainstorm concepts.</p>
                             </div>
                         </div>
                         
                         <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                             <button
                                onClick={() => { setBrainstormMode(false); setCurrentConcepts([]); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!brainstormMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                             >
                                 Detailed Plan
                             </button>
                             <button
                                onClick={() => setBrainstormMode(true)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${brainstormMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                             >
                                 <BrainCircuit className="h-3 w-3" /> Brainstorm
                             </button>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                         <Button 
                            variant="secondary" 
                            onClick={() => handleCampaignAction("Product Launch")} 
                            isLoading={generatingCampaign === "Product Launch"}
                            disabled={!!generatingCampaign}
                            className={`h-auto py-4 flex flex-col gap-2 items-center bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-white ${brainstormMode && selectedConceptType === 'Product Launch' ? 'ring-2 ring-indigo-500' : ''}`}
                         >
                             <Rocket className="h-6 w-6 text-emerald-400" />
                             <span className="text-xs">Viral Launch</span>
                         </Button>
                         <Button 
                            variant="secondary" 
                            onClick={() => handleCampaignAction("Influencer Collaboration")} 
                            isLoading={generatingCampaign === "Influencer Collaboration"}
                            disabled={!!generatingCampaign}
                            className={`h-auto py-4 flex flex-col gap-2 items-center bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-white ${brainstormMode && selectedConceptType === 'Influencer Collaboration' ? 'ring-2 ring-indigo-500' : ''}`}
                         >
                             <Users className="h-6 w-6 text-pink-400" />
                             <span className="text-xs">Influencer Push</span>
                         </Button>
                         <Button 
                            variant="secondary" 
                            onClick={() => handleCampaignAction("Seasonal Promotion")} 
                            isLoading={generatingCampaign === "Seasonal Promotion"}
                            disabled={!!generatingCampaign}
                            className={`h-auto py-4 flex flex-col gap-2 items-center bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-white ${brainstormMode && selectedConceptType === 'Seasonal Promotion' ? 'ring-2 ring-indigo-500' : ''}`}
                         >
                             <Calendar className="h-6 w-6 text-orange-400" />
                             <span className="text-xs">Seasonal Promo</span>
                         </Button>
                         <Button 
                            variant="secondary" 
                            onClick={() => handleCampaignAction("Referral Program")} 
                            isLoading={generatingCampaign === "Referral Program"}
                            disabled={!!generatingCampaign}
                            className={`h-auto py-4 flex flex-col gap-2 items-center bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-white ${brainstormMode && selectedConceptType === 'Referral Program' ? 'ring-2 ring-indigo-500' : ''}`}
                         >
                             <Share2 className="h-6 w-6 text-blue-400" />
                             <span className="text-xs">Referral Loop</span>
                         </Button>

                         {/* Custom Campaign Card */}
                         <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Custom Campaign</span>
                            <div className="flex flex-col gap-2 flex-grow justify-end">
                                <input 
                                    type="text" 
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value)}
                                    placeholder="e.g. PR Stunt"
                                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCampaignAction(customType)}
                                />
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => handleCampaignAction(customType)} 
                                    isLoading={generatingCampaign === customType && customType !== ''}
                                    disabled={!customType.trim() || !!generatingCampaign}
                                    className="w-full h-8 text-xs bg-indigo-600 border-transparent hover:bg-indigo-700 text-white"
                                >
                                    <Zap className="h-3 w-3 mr-1" /> {brainstormMode ? 'Brainstorm' : 'Generate'}
                                </Button>
                            </div>
                         </div>
                     </div>

                     {/* Brainstorm Concepts Preview */}
                     {brainstormMode && currentConcepts.length > 0 && (
                         <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                             <div className="flex items-center gap-2 mb-4">
                                 <BrainCircuit className="h-4 w-4 text-indigo-400" />
                                 <span className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Brainstorming: {selectedConceptType}</span>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 {currentConcepts.map((concept, idx) => (
                                     <div key={idx} className="bg-slate-800/50 border border-indigo-500/30 p-5 rounded-xl hover:bg-slate-800 transition-colors flex flex-col">
                                         <div className="flex justify-between items-start mb-2">
                                             <h4 className="font-bold text-white text-lg">{concept.title}</h4>
                                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${concept.impact === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                 {concept.impact} Impact
                                             </span>
                                         </div>
                                         <p className="text-slate-400 text-sm mb-4 flex-grow">{concept.description}</p>
                                         <div className="flex gap-2">
                                             <Button 
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleSaveConcept(concept)}
                                                className="flex-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-xs"
                                             >
                                                 <Plus className="h-3 w-3 mr-1" /> Save
                                             </Button>
                                             <Button 
                                                size="sm" 
                                                onClick={() => handleCreateCampaign(selectedConceptType, `${concept.title}: ${concept.description}`)}
                                                isLoading={generatingCampaign === selectedConceptType}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-none text-white text-xs"
                                             >
                                                 Execute <ArrowRight className="h-3 w-3 ml-1" />
                                             </Button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
            </div>

            {/* Saved Ideas Bank */}
            {savedConcepts && savedConcepts.length > 0 && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" /> Idea Bank
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedConcepts.slice().reverse().map((concept) => (
                            <div key={concept.id} className="bg-yellow-50/50 border border-yellow-100 p-5 rounded-xl flex flex-col hover:shadow-md transition-shadow relative group">
                                <button 
                                    onClick={() => handleDeleteConcept(concept.id)}
                                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{concept.type}</span>
                                    <h4 className="font-bold text-slate-800">{concept.title}</h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-4 flex-grow">{concept.description}</p>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleCreateCampaign(concept.type, `${concept.title}: ${concept.description}`)}
                                    isLoading={generatingCampaign === concept.type}
                                    className="w-full text-xs"
                                >
                                    Turn into Plan
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Existing Campaigns */}
            {campaigns && campaigns.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detailed Campaign Plans</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {campaigns.slice().reverse().map((camp) => (
                            <div key={camp.id} className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Rocket className="h-32 w-32 text-indigo-600 transform rotate-12" />
                                </div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <span className="inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-100">
                                            {camp.type}
                                        </span>
                                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{camp.title}</h4>
                                    </div>
                                    <div className="bg-slate-100 px-3 py-1 rounded text-xs text-slate-500 border border-slate-200 font-mono">
                                        {camp.timeline}
                                    </div>
                                </div>
                                
                                <p className="text-slate-600 text-sm mb-6 italic border-l-2 border-indigo-200 pl-4 relative z-10">
                                    "{camp.objective}"
                                </p>
                                
                                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                    <div>
                                        <strong className="text-slate-400 text-[10px] uppercase tracking-widest block mb-3">Execution Tactics</strong>
                                        <ul className="space-y-2">
                                            {camp.tactics.map((t, i) => (
                                                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                                    <span>{t}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <strong className="text-slate-400 text-[10px] uppercase tracking-widest block mb-3">Key Channels</strong>
                                        <div className="flex flex-wrap gap-2">
                                            {camp.channels.map((c, i) => (
                                                <span key={i} className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Checklist & Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {checklist && checklist.length > 0 && (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full">
                         <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-emerald-600" /> Launch Checklist
                         </h3>
                         <ul className="space-y-4">
                            {checklist.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 group">
                                    <div className="mt-1 h-5 w-5 rounded-md border-2 border-slate-300 group-hover:border-emerald-500 transition-colors flex-shrink-0"></div>
                                    <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">{item}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                )}

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4 flex items-center gap-2">
                         <Share2 className="h-5 w-5 text-blue-600" /> Social Content
                    </h3>
                    <div className="space-y-4">
                        {socialPosts && socialPosts.map((post, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => navigator.clipboard.writeText(post)}
                                        title="Copy to clipboard"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Post Option {idx + 1}</div>
                                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{post}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};
