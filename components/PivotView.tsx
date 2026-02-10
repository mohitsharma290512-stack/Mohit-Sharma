import React, { useState } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Lightbulb, Rocket, Zap, Search } from 'lucide-react';

interface PivotViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const PivotView: React.FC<PivotViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const result = await geminiService.generatePivots(project.data.idea);
        onUpdate({
            pivot: {
                pivots: result.pivots,
            }
        });
    } catch (e) {
        console.error(e);
        alert("Error generating pivots.");
    } finally {
        setLoading(false);
    }
  };

  const { pivots } = project.data.pivot;

  const getIcon = (type: string) => {
      const t = type.toLowerCase();
      if (t.includes('moonshot') || t.includes('unicorn')) return <Rocket className="h-6 w-6 text-purple-600" />;
      if (t.includes('niche')) return <Search className="h-6 w-6 text-emerald-600" />;
      return <Zap className="h-6 w-6 text-orange-600" />;
  };

  const getColor = (type: string) => {
      const t = type.toLowerCase();
      if (t.includes('moonshot') || t.includes('unicorn')) return 'bg-purple-50 border-purple-100 hover:border-purple-300';
      if (t.includes('niche')) return 'bg-emerald-50 border-emerald-100 hover:border-emerald-300';
      return 'bg-orange-50 border-orange-100 hover:border-orange-300';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Surprise Pivot</h2>
        </div>
        <Button onClick={handleGenerate} isLoading={loading}>
            {pivots && pivots.length > 0 ? 'Shuffle Ideas' : 'Inspire Me'}
        </Button>
      </div>

      {!pivots || pivots.length === 0 ? (
          <div className="bg-white p-16 rounded-xl border border-slate-200 text-center shadow-sm">
             <Lightbulb className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
             <h3 className="text-xl font-semibold text-slate-900 mb-2">Stuck? Let's Pivot.</h3>
             <p className="text-slate-500 max-w-lg mx-auto mb-8">
                AI will reimagine your startup from three radically different angles: The Moonshot, The Niche, and The Wildcard.
             </p>
             <Button onClick={handleGenerate} isLoading={loading} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0">
                Generate Pivots
             </Button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pivots.map((pivot, idx) => (
                <div key={idx} className={`p-6 rounded-xl border-2 transition-all cursor-default ${getColor(pivot.type || '')}`}>
                    <div className="bg-white p-3 rounded-full inline-flex mb-4 shadow-sm">
                        {getIcon(pivot.type || '')}
                    </div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider opacity-60">
                        {pivot.type}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{pivot.title}</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">
                        {pivot.description}
                    </p>
                </div>
            ))}
          </div>
      )}
    </div>
  );
};
