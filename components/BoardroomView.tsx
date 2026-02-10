import React, { useState, useEffect } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Zap, TrendingUp, ShieldAlert, Send, Users } from 'lucide-react';

interface BoardroomViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const BoardroomView: React.FC<BoardroomViewProps> = ({ project, onUpdate, onBack }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get latest history item
  const latestAdvice = project.data.boardroom.history[project.data.boardroom.history.length - 1];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
        const nameToUse = project.data.naming.selectedName || "My Startup";
        const result = await geminiService.askBoardroom(project.data.idea, nameToUse, q);
        
        const newEntry = {
            question: q,
            responses: result,
            timestamp: Date.now()
        };

        const updatedHistory = [...project.data.boardroom.history, newEntry];
        onUpdate({
            boardroom: {
                history: updatedHistory
            }
        });
        setQuestion('');
    } catch (e) {
        console.error(e);
        alert("The board is currently unavailable.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      // Auto-analyze on first visit if empty
      if (project.data.boardroom.history.length === 0 && !loading) {
          handleAsk("Analyze my startup idea and give me your initial impressions.");
      }
  }, []);

  const advisors = [
    {
      id: 'visionary',
      name: 'Steve',
      role: 'The Visionary',
      description: 'Focuses on product excellence, design, and long-term impact.',
      icon: Zap,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      response: latestAdvice?.responses.visionary
    },
    {
      id: 'growth',
      name: 'Marcus',
      role: 'Growth Hacker',
      description: 'Obsessed with traction, sales, viral loops, and speed.',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      response: latestAdvice?.responses.growth
    },
    {
      id: 'skeptic',
      name: 'Linda',
      role: 'The VC Skeptic',
      description: 'Risk-averse. Checks viability, competition, and unit economics.',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      response: latestAdvice?.responses.skeptic
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">The Boardroom</h2>
        </div>
        <div className="hidden md:flex items-center text-sm text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200 backdrop-blur-sm">
            <Users className="h-4 w-4 mr-2" />
            Virtual Advisory Board
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advisors.map((advisor) => {
              const Icon = advisor.icon;
              return (
                  <div key={advisor.id} className={`glass-panel p-6 rounded-2xl border-2 transition-all duration-500 ${advisor.bg}`}>
                      <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-xl bg-white shadow-sm ${advisor.color}`}>
                              <Icon className="h-6 w-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900">{advisor.name}</h3>
                              <p className={`text-xs font-bold uppercase tracking-wider ${advisor.color}`}>{advisor.role}</p>
                          </div>
                      </div>
                      
                      <div className="min-h-[140px] flex flex-col justify-center">
                          {loading ? (
                              <div className="space-y-2 animate-pulse">
                                  <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                                  <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                              </div>
                          ) : advisor.response ? (
                              <div className="relative">
                                  <span className={`absolute -top-3 -left-2 text-4xl opacity-20 font-serif ${advisor.color}`}>"</span>
                                  <p className="text-slate-800 leading-relaxed italic relative z-10 text-sm md:text-base">
                                      {advisor.response}
                                  </p>
                              </div>
                          ) : (
                              <p className="text-slate-400 text-sm italic text-center">Waiting for input...</p>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>

      <div className="max-w-2xl mx-auto">
          {latestAdvice && (
              <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Topic</span>
                  <p className="text-slate-700 font-medium mt-1">"{latestAdvice.question}"</p>
              </div>
          )}

          <div className="glass-panel p-2 rounded-full flex items-center shadow-xl shadow-indigo-500/10 border-2 border-white/50 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk(question)}
                placeholder="Ask your board (e.g., 'How do I get my first 100 users?')"
                className="flex-grow bg-transparent border-none focus:ring-0 px-6 py-3 text-slate-800 placeholder-slate-400 outline-none"
                disabled={loading}
              />
              <Button 
                onClick={() => handleAsk(question)} 
                disabled={!question.trim() || loading}
                isLoading={loading}
                className="rounded-full h-12 w-12 p-0 flex-shrink-0"
              >
                  {!loading && <Send className="h-5 w-5" />}
              </Button>
          </div>
          
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {['Should I pivot?', 'Critique my pricing model', 'What is my biggest risk?'].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => handleAsk(suggestion)}
                    className="text-xs bg-white/50 hover:bg-white text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                  >
                      {suggestion}
                  </button>
              ))}
          </div>
      </div>
    </div>
  );
};
