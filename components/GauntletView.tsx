import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Briefcase, DollarSign, Send, Trophy, XCircle, TrendingUp, User } from 'lucide-react';

interface GauntletViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const GauntletView: React.FC<GauntletViewProps> = ({ project, onUpdate, onBack }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { status, interestLevel, history, termSheet, feedback } = project.data.gauntlet;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleStart = async () => {
    setLoading(true);
    try {
        const result = await geminiService.startGauntlet(project.data.idea);
        onUpdate({
            gauntlet: {
                status: 'active',
                interestLevel: 50,
                history: [{
                    speaker: 'VC',
                    name: 'The Shark',
                    text: result.text
                }],
                feedback: null,
                termSheet: null
            }
        });
    } catch (e) {
        console.error(e);
        alert("The investors are busy. Try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleReply = async () => {
      if (!input.trim()) return;
      const userMsg = input;
      setInput('');
      setLoading(true);

      // Optimistic update
      const newHistory = [
          ...history,
          { speaker: 'User' as const, text: userMsg }
      ];

      onUpdate({
          gauntlet: {
              ...project.data.gauntlet,
              history: newHistory
          }
      });

      try {
          const result = await geminiService.runGauntletTurn(
              project.data.idea,
              newHistory,
              userMsg
          );

          const nextHistory = [
              ...newHistory,
              { speaker: 'VC' as const, name: result.nextSpeakerName, text: result.responseText }
          ];

          let newStatus = status;
          if (result.isGameOver) {
              newStatus = result.termSheet ? 'funded' : 'rejected';
          }

          onUpdate({
              gauntlet: {
                  status: newStatus as any,
                  interestLevel: Math.max(0, Math.min(100, interestLevel + result.interestChange)),
                  history: nextHistory,
                  feedback: result.feedback,
                  termSheet: result.termSheet
              }
          });

      } catch (e) {
          console.error(e);
          alert("Connection lost.");
      } finally {
          setLoading(false);
      }
  };

  if (status === 'idle') {
      return (
        <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col justify-center">
            <div className="flex items-center gap-4 absolute top-24">
                <Button variant="ghost" onClick={onBack} size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>
            
            <div className="bg-slate-900 p-12 md:p-20 rounded-[2.5rem] border border-slate-700 text-center shadow-2xl mx-auto max-w-2xl relative overflow-hidden group">
                {/* Spotlight effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
                
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl inline-flex mb-8 shadow-lg shadow-indigo-900/50">
                    <Briefcase className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">The Gauntlet</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
                    A high-stakes simulation with 3 AI investors.<br/>
                    Survive their questioning to earn a Term Sheet, or get rejected with brutal honesty.
                </p>
                <div className="flex flex-col gap-4 items-center">
                    <Button onClick={handleStart} isLoading={loading} size="lg" className="w-full md:w-auto h-16 text-lg px-12 bg-white text-indigo-900 hover:bg-slate-100 border-none shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Enter The Room
                    </Button>
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">Warning: They will not be nice.</p>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6">
      {/* HUD */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg border border-slate-800">
          <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} size="sm" className="text-slate-400 hover:text-white">
                 <ArrowLeft className="h-4 w-4 mr-2" /> Exit
              </Button>
              <h2 className="font-bold hidden md:block">The Gauntlet</h2>
          </div>
          
          <div className="flex items-center gap-6">
              <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Investor Interest</span>
                  <div className="flex items-center gap-2 justify-end">
                      <TrendingUp className={`h-4 w-4 ${interestLevel > 50 ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-xl font-black">{interestLevel}%</span>
                  </div>
              </div>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${interestLevel > 60 ? 'bg-green-500' : interestLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${interestLevel}%` }}
                  ></div>
              </div>
          </div>
      </div>

      {/* Main Chat */}
      <div className="flex-grow bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
          
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {history.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${msg.speaker === 'User' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'} p-5 rounded-2xl shadow-sm text-sm leading-relaxed relative group`}>
                          {msg.speaker === 'VC' && (
                              <span className="absolute -top-3 left-4 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                  {msg.name}
                              </span>
                          )}
                          {msg.text}
                      </div>
                  </div>
              ))}
              
              {status === 'funded' && termSheet && (
                  <div className="animate-[slideInUp_0.5s_ease-out] mx-auto max-w-lg">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-8 rounded-2xl shadow-xl text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                          <div className="bg-emerald-100 p-4 rounded-full inline-flex mb-4">
                              <Trophy className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h3 className="text-2xl font-black text-emerald-900 mb-2">TERM SHEET OFFERED</h3>
                          <div className="grid grid-cols-3 gap-4 my-6">
                              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                                  <span className="block text-xs text-slate-500 uppercase font-bold">Valuation</span>
                                  <span className="block text-lg font-black text-emerald-600">{termSheet.valuation}</span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                                  <span className="block text-xs text-slate-500 uppercase font-bold">Investment</span>
                                  <span className="block text-lg font-black text-emerald-600">{termSheet.investment}</span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                                  <span className="block text-xs text-slate-500 uppercase font-bold">Equity</span>
                                  <span className="block text-lg font-black text-emerald-600">{termSheet.equity}</span>
                              </div>
                          </div>
                          <p className="text-slate-600 italic text-sm border-t border-emerald-100 pt-4">"{feedback}"</p>
                          <Button onClick={() => alert("Congratulations! Simulation Complete.")} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 border-none text-white">Accept Deal</Button>
                      </div>
                  </div>
              )}

              {status === 'rejected' && (
                   <div className="animate-[slideInUp_0.5s_ease-out] mx-auto max-w-lg">
                       <div className="bg-red-50 border-2 border-red-100 p-8 rounded-2xl shadow-xl text-center">
                           <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                               <XCircle className="h-8 w-8 text-red-600" />
                           </div>
                           <h3 className="text-2xl font-black text-red-900 mb-2">PASS</h3>
                           <p className="text-red-800 font-medium mb-4">The investors decided not to move forward.</p>
                           <div className="bg-white p-4 rounded-xl border border-red-100 text-left">
                               <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-2">Feedback</span>
                               <p className="text-slate-700 text-sm leading-relaxed">{feedback}</p>
                           </div>
                           <Button onClick={() => onUpdate({ gauntlet: { ...project.data.gauntlet, status: 'idle' } })} variant="outline" className="mt-6 w-full">Try Again</Button>
                       </div>
                   </div>
              )}
              
              <div ref={scrollRef} />
          </div>

          {/* Input */}
          {status === 'active' && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                        placeholder="Type your response..."
                        disabled={loading}
                        autoFocus
                        className="flex-grow pl-5 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      />
                      <Button 
                        onClick={handleReply} 
                        disabled={!input.trim() || loading}
                        isLoading={loading}
                        className="px-6 rounded-xl"
                      >
                         <Send className="h-5 w-5" />
                      </Button>
                  </div>
              </div>
          )}
      </div>
      
      <style>{`
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
