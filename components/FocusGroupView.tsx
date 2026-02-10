import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, UserPlus, Users, MessageCircle, Send, Sparkles } from 'lucide-react';

interface FocusGroupViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const FocusGroupView: React.FC<FocusGroupViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { personas, history } = project.data.focusGroup;

  const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [history, personas]);

  const handleRecruit = async () => {
    setLoading(true);
    try {
        const result = await geminiService.generateFocusGroupPersonas(project.data.idea);
        
        // Add IDs if missing or normalize
        const newPersonas = result.personas.map((p: any, idx: number) => ({
            ...p,
            id: `persona${idx + 1}` // Ensure consistent IDs for mapping
        }));

        onUpdate({
            focusGroup: {
                personas: newPersonas,
                history: []
            }
        });
    } catch (e) {
        console.error(e);
        alert("Failed to recruit personas.");
    } finally {
        setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const currentQuestion = question;
    setQuestion('');
    
    try {
        // Map current personas to pass to service
        const result = await geminiService.runFocusGroupSession(
            project.data.idea, 
            personas, 
            currentQuestion
        );
        
        const newHistoryItem = {
            question: currentQuestion,
            responses: result.responses, // { persona1: "...", persona2: "..." }
            analysis: result.analysis,
            timestamp: Date.now()
        };

        onUpdate({
            focusGroup: {
                ...project.data.focusGroup,
                history: [...history, newHistoryItem]
            }
        });
    } catch (e) {
        console.error(e);
        alert("The group remained silent. Try again.");
        setQuestion(currentQuestion); // Restore input
    } finally {
        setLoading(false);
    }
  };

  const colors = [
      "bg-gradient-to-br from-pink-400 to-rose-500",
      "bg-gradient-to-br from-teal-400 to-emerald-500",
      "bg-gradient-to-br from-blue-400 to-indigo-500"
  ];

  if (personas.length === 0) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col justify-center">
            <div className="flex items-center gap-4 absolute top-24">
                <Button variant="ghost" onClick={onBack} size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>
            
            <div className="bg-white p-12 md:p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-xl mx-auto max-w-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600"></div>
                <div className="bg-indigo-50 p-6 rounded-full inline-flex mb-8">
                    <Users className="h-16 w-16 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Synthetic Focus Group</h2>
                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                    Recruit AI agents that perfectly match your target audience.<br/>
                    Validate your idea, pricing, and features with a simulated user interview.
                </p>
                <Button onClick={handleRecruit} isLoading={loading} size="lg" className="w-full md:w-auto h-16 text-lg px-12">
                    <UserPlus className="mr-2 h-5 w-5" /> Recruit Participants
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Focus Group Session</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleRecruit} isLoading={loading}>
            <Users className="h-4 w-4 mr-2" /> Re-roll Participants
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Persona Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pb-4">
            {personas.map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${colors[idx % colors.length]}`}>
                            {p.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">{p.name}</h3>
                            <p className="text-xs font-semibold text-slate-500">{p.age} • {p.occupation}</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-600 italic mb-2">"{p.bio}"</p>
                    <div className="bg-slate-50 p-2 rounded text-[10px] text-slate-500 border border-slate-100">
                        <span className="font-bold">Pain Point:</span> {p.painPoints}
                    </div>
                </div>
            ))}
        </div>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                {history.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
                        <p>Ask your potential customers anything.</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setQuestion("Would you use this product?")} className="px-3 py-1 bg-white border rounded-full text-xs hover:bg-slate-50">Would you use this?</button>
                            <button onClick={() => setQuestion("Is the price of $20/mo too high?")} className="px-3 py-1 bg-white border rounded-full text-xs hover:bg-slate-50">Is $20 too expensive?</button>
                        </div>
                     </div>
                )}
                
                {history.map((turn, tIdx) => (
                    <div key={tIdx} className="space-y-6">
                        {/* User Question */}
                        <div className="flex justify-end">
                             <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">
                                 <p className="font-medium">{turn.question}</p>
                             </div>
                        </div>

                        {/* Responses */}
                        <div className="grid gap-4 pl-4 border-l-2 border-slate-200">
                             {personas.map((p, pIdx) => {
                                 const response = turn.responses[`persona${pIdx + 1}`];
                                 if (!response) return null;
                                 return (
                                     <div key={p.id} className="flex gap-4">
                                         <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${colors[pIdx % colors.length]}`}>
                                             {p.name.charAt(0)}
                                         </div>
                                         <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm text-slate-700 text-sm leading-relaxed">
                                             <span className="block text-xs font-bold text-slate-400 mb-1">{p.name}</span>
                                             {response}
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>

                        {/* Moderator Summary */}
                        {turn.analysis && (
                            <div className="mx-auto max-w-lg bg-yellow-50 border border-yellow-100 p-3 rounded-xl flex items-start gap-3 text-sm text-yellow-800">
                                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                                <div>
                                    <span className="font-bold block text-xs uppercase tracking-wide text-yellow-600 mb-1">Moderator Summary</span>
                                    {turn.analysis}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 relative">
                    <input 
                        type="text" 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        placeholder="Ask a question..." 
                        disabled={loading}
                        className="flex-grow pl-5 pr-12 py-3 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-slate-800 placeholder-slate-400"
                    />
                    <Button 
                        onClick={handleAsk} 
                        disabled={!question.trim() || loading} 
                        isLoading={loading}
                        className="rounded-full h-12 w-12 p-0 flex-shrink-0"
                    >
                       {!loading && <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
