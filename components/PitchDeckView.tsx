
import React, { useState } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Presentation, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PitchDeckViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const PitchDeckView: React.FC<PitchDeckViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const nameToUse = project.data.naming.selectedName || "My Startup";
        const result = await geminiService.generatePitchDeck(project.data.idea, nameToUse);
        onUpdate({
            pitchDeck: {
                slides: result.slides,
            }
        });
    } catch (e) {
        console.error(e);
        alert("Error generating pitch deck.");
    } finally {
        setLoading(false);
    }
  };

  const slides = project.data.pitchDeck.slides || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Investor Pitch Deck</h2>
        </div>
        <Button onClick={handleGenerate} isLoading={loading}>
            {slides && slides.length > 0 ? 'Regenerate Deck' : 'Generate Deck'}
        </Button>
      </div>

      {!slides || slides.length === 0 ? (
          <div className="bg-white p-16 rounded-xl border border-slate-200 text-center shadow-sm">
             <Presentation className="h-16 w-16 text-indigo-200 mx-auto mb-6" />
             <h3 className="text-xl font-semibold text-slate-900 mb-2">Create a Winning Pitch</h3>
             <p className="text-slate-500 max-w-lg mx-auto mb-8">
                Generate a professional 10-slide structure optimized for investors, including key talking points and visual suggestions.
             </p>
             <Button onClick={handleGenerate} isLoading={loading} size="lg">
                Generate Pitch Deck
             </Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {slides.map((slide, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slide {idx + 1}</span>
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    </div>
                    <div className="p-6 flex-grow">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{slide.title}</h3>
                        <div className="prose prose-sm prose-slate mb-6">
                            <ReactMarkdown>{slide.content}</ReactMarkdown>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-800 border border-indigo-100">
                            <span className="font-semibold block mb-1 text-xs uppercase">Visual Cue:</span>
                            {slide.visualCue}
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
};
