
import React, { useState } from 'react';
import { Project, ProjectData, Competitor } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Search, TrendingUp, AlertTriangle, CheckCircle, Crosshair, BarChart3, Plus, Trash2, X, Save } from 'lucide-react';

interface CompetitorAnalysisViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const CompetitorAnalysisView: React.FC<CompetitorAnalysisViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newComp, setNewComp] = useState<Competitor>({
      name: '',
      type: 'Direct',
      description: '',
      strengths: [],
      weaknesses: [],
      marketShareEst: 10,
      differentiator: ''
  });
  const [tempStrengths, setTempStrengths] = useState('');
  const [tempWeaknesses, setTempWeaknesses] = useState('');

  const { competitors, marketSummary } = project.data.competitorAnalysis;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
        const result = await geminiService.analyzeCompetitors(project.data.idea);
        onUpdate({
            competitorAnalysis: {
                competitors: result.competitors,
                marketSummary: result.marketSummary
            }
        });
    } catch (e) {
        console.error(e);
        alert("Analysis failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleAdd = () => {
      setNewComp({
        name: '',
        type: 'Direct',
        description: '',
        strengths: [],
        weaknesses: [],
        marketShareEst: 10,
        differentiator: ''
      });
      setTempStrengths('');
      setTempWeaknesses('');
      setIsAdding(true);
  };

  const handleSaveCompetitor = () => {
      if (!newComp.name) return;
      const comp: Competitor = {
          ...newComp,
          strengths: tempStrengths.split(',').map(s => s.trim()).filter(s => s),
          weaknesses: tempWeaknesses.split(',').map(s => s.trim()).filter(s => s)
      };
      
      const updatedList = [...competitors, comp];
      onUpdate({
          competitorAnalysis: {
              ...project.data.competitorAnalysis,
              competitors: updatedList
          }
      });
      setIsAdding(false);
  };

  const handleDeleteCompetitor = (idx: number) => {
      if (window.confirm("Remove this competitor?")) {
          const updatedList = competitors.filter((_, i) => i !== idx);
          onUpdate({
            competitorAnalysis: {
                ...project.data.competitorAnalysis,
                competitors: updatedList
            }
          });
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Competitor Intelligence</h2>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" /> Add Competitor
            </Button>
            <Button onClick={handleAnalyze} isLoading={loading}>
                {competitors.length > 0 ? 'Refresh AI Analysis' : 'Scan Market with AI'}
            </Button>
        </div>
      </div>

      {!competitors || competitors.length === 0 ? (
          <div className="bg-white p-16 rounded-[2rem] border border-slate-200 text-center shadow-lg hover:shadow-xl transition-all duration-500">
             <div className="bg-blue-50 p-6 rounded-full inline-flex mb-6">
                 <Search className="h-12 w-12 text-blue-500" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Know Your Enemy</h3>
             <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg">
                Identify key competitors, uncover their weaknesses, and find your strategic advantage in the market.
             </p>
             <div className="flex gap-4 justify-center">
                 <Button onClick={handleAnalyze} isLoading={loading} size="lg" className="px-8 h-14 text-lg">
                    Analyze Competitive Landscape
                 </Button>
                 <Button onClick={handleAdd} variant="secondary" size="lg" className="px-8 h-14 text-lg">
                    Manually Add Competitor
                 </Button>
             </div>
          </div>
      ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Market Summary Card */}
              {marketSummary && (
                  <div className="glass-panel p-8 rounded-3xl border border-white/60 bg-gradient-to-br from-indigo-50/50 to-white/80">
                      <div className="flex items-start gap-4">
                          <div className="p-3 bg-indigo-100 rounded-xl">
                              <BarChart3 className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-slate-900 mb-2">Market Overview</h3>
                              <p className="text-slate-700 leading-relaxed text-lg">{marketSummary}</p>
                          </div>
                      </div>
                  </div>
              )}

              {/* Competitor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {competitors.map((comp, idx) => (
                      <div key={idx} className="hyper-card group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden">
                          {/* Threat Level / Market Share Indicator */}
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                              <span className="text-9xl font-black text-slate-900 leading-none">{idx + 1}</span>
                          </div>
                          
                          <button 
                             onClick={() => handleDeleteCompetitor(idx)}
                             className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 z-20"
                          >
                              <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="relative z-10">
                              <div className="flex justify-between items-start mb-4 pr-10">
                                  <div>
                                      <h3 className="text-2xl font-bold text-slate-900">{comp.name}</h3>
                                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                          comp.type === 'Direct' ? 'bg-red-100 text-red-600' : 
                                          comp.type === 'Indirect' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                      }`}>
                                          {comp.type} Competitor
                                      </span>
                                  </div>
                                  <div className="text-right">
                                      <span className="block text-[10px] uppercase font-bold text-slate-400">Est. Share</span>
                                      <span className="text-xl font-black text-slate-700">{comp.marketShareEst}%</span>
                                  </div>
                              </div>
                              
                              <p className="text-slate-600 mb-6 text-sm leading-relaxed min-h-[40px]">{comp.description}</p>

                              <div className="space-y-4">
                                  {/* Strengths */}
                                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                          <TrendingUp className="h-4 w-4" /> Their Strengths
                                      </h4>
                                      <ul className="space-y-1">
                                          {comp.strengths.slice(0, 3).map((s, i) => (
                                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                  <CheckCircle className="h-3 w-3 mt-1 text-emerald-500 flex-shrink-0" /> {s}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>

                                  {/* Weaknesses */}
                                  <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100">
                                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">
                                          <AlertTriangle className="h-4 w-4" /> Their Weaknesses
                                      </h4>
                                      <ul className="space-y-1">
                                          {comp.weaknesses.slice(0, 3).map((w, i) => (
                                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                  <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></div> {w}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>

                                  {/* How to Win */}
                                  <div className="pt-4 mt-2 border-t border-slate-100">
                                      <div className="flex items-start gap-3">
                                          <div className="p-2 bg-indigo-100 rounded-lg">
                                              <Crosshair className="h-5 w-5 text-indigo-600" />
                                          </div>
                                          <div>
                                              <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">How We Win</span>
                                              <p className="text-sm font-medium text-slate-800 leading-snug">{comp.differentiator}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Add Competitor Modal */}
      {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
              <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
                      <X className="h-5 w-5" />
                  </button>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Add Competitor</h3>
                  
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                          <input 
                            type="text" 
                            value={newComp.name}
                            onChange={e => setNewComp({...newComp, name: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none"
                            placeholder="Competitor Name"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                              <select 
                                value={newComp.type}
                                onChange={e => setNewComp({...newComp, type: e.target.value as any})}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white"
                              >
                                  <option value="Direct">Direct</option>
                                  <option value="Indirect">Indirect</option>
                                  <option value="Future">Future</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Est. Market Share (%)</label>
                              <input 
                                type="number" 
                                min="0" max="100"
                                value={newComp.marketShareEst}
                                onChange={e => setNewComp({...newComp, marketShareEst: parseInt(e.target.value) || 0})}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                          <textarea 
                            value={newComp.description}
                            onChange={e => setNewComp({...newComp, description: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none h-20 resize-none"
                            placeholder="What do they do?"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Strengths (comma separated)</label>
                          <input 
                            type="text" 
                            value={tempStrengths}
                            onChange={e => setTempStrengths(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="Good pricing, Fast shipping..."
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weaknesses (comma separated)</label>
                          <input 
                            type="text" 
                            value={tempWeaknesses}
                            onChange={e => setTempWeaknesses(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="Slow support, Buggy app..."
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Differentiator</label>
                          <textarea 
                            value={newComp.differentiator}
                            onChange={e => setNewComp({...newComp, differentiator: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none h-20 resize-none"
                            placeholder="How will you beat them?"
                          />
                      </div>
                  </div>

                  <div className="pt-6 mt-2 border-t border-slate-100">
                      <Button onClick={handleSaveCompetitor} className="w-full" disabled={!newComp.name}>
                          <Save className="h-4 w-4 mr-2" /> Save Competitor
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
