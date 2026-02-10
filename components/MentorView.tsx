
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Send, Mic, Volume2, GraduationCap, Sparkles, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

interface MentorViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const MentorView: React.FC<MentorViewProps> = ({ project, onUpdate, onBack }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null); // ID of message playing
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const { messages } = project.data.mentor;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio context on first interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    initAudio();
    const userText = text;
    setInput('');
    setLoading(true);

    const newMsgUser = {
        id: uuidv4(),
        role: 'user' as const,
        text: userText,
        timestamp: Date.now()
    };

    const updatedHistory = [...messages, newMsgUser];
    
    // Optimistic update
    onUpdate({
        mentor: { messages: updatedHistory }
    });

    try {
        const responseText = await geminiService.chatWithMentor(
            project.data.idea, 
            updatedHistory, 
            userText
        );

        const newMsgMentor = {
            id: uuidv4(),
            role: 'mentor' as const,
            text: responseText,
            timestamp: Date.now()
        };

        onUpdate({
            mentor: { messages: [...updatedHistory, newMsgMentor] }
        });

    } catch (e) {
        console.error(e);
        alert("Mentor is currently unavailable.");
    } finally {
        setLoading(false);
    }
  };

  const playAudio = async (text: string, id: string) => {
      try {
          initAudio();
          
          if (audioPlaying === id) {
              // Stop if currently playing this ID
              currentSourceRef.current?.stop();
              setAudioPlaying(null);
              return;
          } else if (audioPlaying) {
              // Stop others
              currentSourceRef.current?.stop();
          }

          setAudioPlaying(id);
          const base64Audio = await geminiService.generateSpeech(text);
          
          if (!base64Audio || !audioContextRef.current) return;

          // Decode raw PCM from Gemini (base64)
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Important: Gemini TTS returns raw PCM. We need to specify format or use decodeAudioData if wrapped in wav, 
          // but the current SDK returns raw PCM often. However, the browser decodeAudioData is robust if headers exist. 
          // If Gemini sends raw PCM without headers, we might need manual buffer creation. 
          // *Correction based on instructions*: Instructions say "The audio bytes returned by the API is raw PCM data... contains no header".
          // So we must create buffer manually.
          
          const audioCtx = audioContextRef.current;
          // Gemini 2.5 TTS defaults: 24000Hz, 1 channel usually.
          const pcmData = new Int16Array(bytes.buffer);
          const buffer = audioCtx.createBuffer(1, pcmData.length, 24000);
          const channelData = buffer.getChannelData(0);
          
          // Convert Int16 to Float32
          for (let i = 0; i < pcmData.length; i++) {
              channelData[i] = pcmData[i] / 32768.0;
          }

          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.onended = () => setAudioPlaying(null);
          currentSourceRef.current = source;
          source.start();

      } catch (e) {
          console.error("Audio playback error", e);
          setAudioPlaying(null);
      }
  };

  const suggestions = [
      "Teach me about my Business Model",
      "What is my unfair advantage?",
      "How do I get my first 100 users?",
      "Roast my startup idea"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Founder School</h2>
                    <p className="text-xs text-slate-500">Mentorship & Learning Mode</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col relative">
          
          {messages.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="h-10 w-10 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Founder School</h3>
                  <p className="text-slate-500 max-w-md mb-8">
                      I'm your AI Mentor. I know everything about your project. 
                      Let's talk through your strategy, learn new concepts, or refine your pitch.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                      {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSendMessage(s)}
                            className="p-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-indigo-300 hover:shadow-md transition-all text-left"
                          >
                              {s}
                          </button>
                      ))}
                  </div>
              </div>
          ) : (
              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50">
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1
                                ${msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white'}
                              `}>
                                  {msg.role === 'user' ? 'Me' : <GraduationCap className="h-4 w-4" />}
                              </div>
                              
                              <div className={`p-4 rounded-2xl shadow-sm relative group ${
                                  msg.role === 'user' 
                                  ? 'bg-white text-slate-800 rounded-tr-none' 
                                  : 'bg-white text-slate-800 rounded-tl-none border border-indigo-100'
                              }`}>
                                  <div className="prose prose-sm prose-slate max-w-none">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                  </div>
                                  
                                  {msg.role === 'mentor' && (
                                      <div className="mt-3 flex items-center pt-2 border-t border-slate-100">
                                          <button 
                                            onClick={() => playAudio(msg.text, msg.id)}
                                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors"
                                          >
                                              {audioPlaying === msg.id ? (
                                                  <><StopCircle className="h-3 w-3 animate-pulse" /> Stop Listening</>
                                              ) : (
                                                  <><Volume2 className="h-3 w-3" /> Listen</>
                                              )}
                                          </button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
                  <div ref={scrollRef} />
              </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask your mentor anything..." 
                    disabled={loading}
                    autoFocus
                    className="flex-grow pl-5 pr-5 py-4 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-slate-800 placeholder-slate-400"
                  />
                  <Button 
                      onClick={() => handleSendMessage()} 
                      disabled={!input.trim() || loading} 
                      isLoading={loading}
                      className="rounded-xl h-auto w-14 p-0 flex-shrink-0"
                  >
                     <Send className="h-5 w-5" />
                  </Button>
              </div>
          </div>
      </div>
    </div>
  );
};
