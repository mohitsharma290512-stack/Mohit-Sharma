import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Swords, Shield, Skull, Target, Zap, Trophy, History } from 'lucide-react';

interface CompetitorViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const CompetitorView: React.FC<CompetitorViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [userAction, setUserAction] = useState('');
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { nemesis, marketShare, rounds } = project.data.competitor;

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [rounds, currentEvent]);

  const handleCreateNemesis = async () => {
    setLoading(true);
    try {
        const result = await geminiService.generateNemesis(project.data.idea);
        onUpdate({
            competitor: {
                nemesis: result,
                marketShare: 50,
                rounds: []
            }
        });
        // Immediately trigger first event
        await triggerEvent(result);
    } catch (e) {
        console.error(e);
        alert("Failed to detect nemesis.");
        setLoading(false);
    }
  };

  const triggerEvent = async (activeNemesis: any) => {
      setLoading(true);
      try {
        const result = await geminiService.generateWargameEvent(
            project.data.idea,
            activeNemesis,
            rounds.length + 1
        );
        setCurrentEvent(result.event);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleAction = async () => {
      if (!currentEvent || !userAction.trim() || !nemesis) return;
      setLoading(true);
      
      try {
          const result = await geminiService.resolveWargameTurn(
              project.data.idea,
              nemesis,
              currentEvent,
              userAction
          );
          
          const newMarketShare = Math.max(0, Math.min(100, marketShare + result.marketShareChange));
          
          const newRound = {
              event: currentEvent,
              playerAction: userAction,
              outcome: result.outcome,
              marketShareChange: result.marketShareChange
          };

          const updatedRounds = [...rounds, newRound];

          onUpdate({
              competitor: {
                  ...project.data.competitor,
                  marketShare: newMarketShare,
                  rounds: updatedRounds
              }
          });
          
          setUserAction('');
          setCurrentEvent(null);
          
          // Trigger next event if game not over
          if (newMarketShare > 0 && newMarketShare < 100) {
             setTimeout(() => triggerEvent(nemesis), 1500); // Slight delay for pacing
          }

      } catch (e) {
          console.error(e);
          alert("Failed to execute strategy.");
      } finally {
          setLoading(false);
      }
  };

  if (!nemesis) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col justify-center">
            <div className="flex items-center gap-4 absolute top-24">
                <Button variant="ghost" onClick={onBack} size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>
            
            <div className="bg-slate-900 p-12 md:p-20 rounded-[2.5rem] border border-slate-700 text-center shadow-2xl mx-auto max-w-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
                <div className="bg-red-500/20 p-6 rounded-full inline-flex mb-8 animate-pulse">
                    <Swords className="h-16 w-16 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Competitor Wargames</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                    The AI will analyze your idea and generate a "Nemesis"—a perfectly crafted competitor designed to exploit your weaknesses.<br/><br/>
                    Do you have the strategy to survive?
                </p>
                <Button onClick={handleCreateNemesis} isLoading={loading} size="lg" className="w-full md:w-auto h-16 text-lg px-12 bg-red-600 hover:bg-red-700 hover:shadow-red-500/50 border-transparent text-white">
                    <Target className="mr-2 h-5 w-5" /> Start Simulation
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
            <h2 className="text-2xl font-bold text-slate-900">Battlefield</h2>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Share</span>
                <span className={`block font-black text-xl ${marketShare > 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketShare}%
                </span>
            </div>
            <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden flex">
                <div style={{ width: `${marketShare}%` }} className="bg-indigo-600 h-full transition-all duration-500"></div>
                <div style={{ width: `${100 - marketShare}%` }} className="bg-red-500 h-full transition-all duration-500"></div>
            </div>
            <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{nemesis.name}</span>
                <span className="block font-black text-xl text-slate-700">
                    {100 - marketShare}%
                </span>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Nemesis Profile */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-500 rounded-full blur-3xl opacity-20"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Skull className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg">{nemesis.name}</h3>
                </div>
                <p className="text-red-200 text-sm font-medium italic mb-4">"{nemesis.tagline}"</p>
                <div className="space-y-4 text-sm text-slate-300">
                    <div>
                        <strong className="text-white block text-xs uppercase tracking-wider mb-1">Bio</strong>
                        {nemesis.bio}
                    </div>
                    <div>
                        <strong className="text-white block text-xs uppercase tracking-wider mb-1">Superpower</strong>
                        <span className="text-green-400">{nemesis.strength}</span>
                    </div>
                    <div>
                        <strong className="text-white block text-xs uppercase tracking-wider mb-1">Weakness</strong>
                        <span className="text-red-400">{nemesis.weakness}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 flex-grow overflow-y-auto">
                 <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><History className="h-4 w-4" /> Battle Log</h4>
                 <div className="space-y-4">
                     {rounds.map((round, idx) => (
                         <div key={idx} className="text-xs border-l-2 pl-3 py-1 border-slate-200">
                             <span className="font-bold text-slate-700 block mb-1">Round {idx + 1}</span>
                             <div className="flex justify-between items-center text-slate-500 mb-1">
                                <span>Change</span>
                                <span className={`font-bold ${round.marketShareChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {round.marketShareChange > 0 ? '+' : ''}{round.marketShareChange}%
                                </span>
                             </div>
                             <p className="opacity-70 truncate">{round.outcome}</p>
                         </div>
                     ))}
                     {rounds.length === 0 && <p className="text-slate-400 text-xs italic">Simulation starting...</p>}
                 </div>
            </div>
        </div>

        {/* Main Interface */}
        <div className="flex-grow flex flex-col bg-slate-50 rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative">
            
            {/* Simulation Feed */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {rounds.map((round, idx) => (
                    <div key={idx} className="space-y-4 opacity-75 hover:opacity-100 transition-opacity">
                        {/* Event Card */}
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start max-w-2xl">
                            <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">Incoming Threat</span>
                                <p className="text-red-900">{round.event}</p>
                            </div>
                        </div>

                        {/* Player Action */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl flex gap-3 items-start max-w-2xl ml-auto">
                            <Zap className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">Your Strategy</span>
                                <p className="text-slate-800">{round.playerAction}</p>
                            </div>
                        </div>

                        {/* Outcome */}
                        <div className={`p-4 rounded-xl border flex gap-3 items-start max-w-3xl mx-auto ${round.marketShareChange >= 0 ? 'bg-green-50 border-green-100' : 'bg-slate-200 border-slate-300'}`}>
                            <Trophy className={`h-5 w-5 flex-shrink-0 mt-0.5 ${round.marketShareChange >= 0 ? 'text-green-600' : 'text-slate-600'}`} />
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${round.marketShareChange >= 0 ? 'text-green-800' : 'text-slate-700'}`}>
                                    Market Reaction ({round.marketShareChange > 0 ? '+' : ''}{round.marketShareChange}%)
                                </span>
                                <p className="text-slate-800 text-sm leading-relaxed">{round.outcome}</p>
                            </div>
                        </div>
                        <div className="h-px bg-slate-200 w-full my-4"></div>
                    </div>
                ))}

                {currentEvent && (
                    <div className="animate-[slideInUp_0.3s_ease-out]">
                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex gap-4 items-start shadow-lg ring-4 ring-red-50">
                            <div className="p-3 bg-red-100 rounded-full animate-bounce">
                                <Shield className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <span className="text-xs font-black text-red-600 uppercase tracking-widest block mb-2 animate-pulse">Live Threat Detected</span>
                                <p className="text-red-900 text-lg font-medium">{currentEvent}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {marketShare <= 0 && (
                     <div className="p-8 text-center">
                         <h2 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h2>
                         <p className="text-slate-500">Your startup has run out of runway.</p>
                     </div>
                )}
                {marketShare >= 100 && (
                     <div className="p-8 text-center">
                         <h2 className="text-4xl font-black text-green-500 mb-2">VICTORY</h2>
                         <p className="text-slate-500">You have dominated the market.</p>
                     </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            {currentEvent && marketShare > 0 && marketShare < 100 && (
                <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Deploy Counter-Measure</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={userAction}
                            onChange={(e) => setUserAction(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                            placeholder="e.g. Pivot to enterprise, launch a referral program, lower prices..." 
                            disabled={loading}
                            autoFocus
                            className="flex-grow pl-5 pr-5 py-3 bg-slate-100 border-2 border-transparent focus:border-indigo-500 rounded-xl transition-all outline-none text-slate-800 placeholder-slate-400"
                        />
                        <Button 
                            onClick={handleAction} 
                            disabled={!userAction.trim() || loading} 
                            isLoading={loading}
                            className="rounded-xl px-8"
                        >
                           Execute
                        </Button>
                    </div>
                </div>
            )}
        </div>
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
