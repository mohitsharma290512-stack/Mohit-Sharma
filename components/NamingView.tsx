
import React, { useState } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, RefreshCw, Check } from 'lucide-react';

interface NamingViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const NamingView: React.FC<NamingViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await geminiService.generateNames(project.data.idea);
      onUpdate({
        naming: {
          ...project.data.naming,
          suggestions: result.names,
          rationale: result.rationale,
        }
      });
    } catch (err) {
      setError("Failed to generate names. Please check your API Key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (name: string) => {
    onUpdate({
      naming: {
        ...project.data.naming,
        selectedName: name
      }
    });
  };

  const suggestions = project.data.naming.suggestions || [];
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">Name Your Startup</h2>
      </div>

      {!hasSuggestions ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="mb-6 mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Let's find a great name</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                AI will analyze your project description and target audience to generate memorable, relevant brand names.
            </p>
            <Button onClick={handleGenerate} isLoading={loading} size="lg">
                Generate Ideas
            </Button>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800 text-sm">
                <strong>AI Insight:</strong> {project.data.naming.rationale}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {suggestions.map((name) => (
                    <div 
                        key={name}
                        onClick={() => handleSelect(name)}
                        className={`
                            cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center h-32
                            ${project.data.naming.selectedName === name 
                                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'}
                        `}
                    >
                        <span className="text-xl font-bold text-slate-900">{name}</span>
                        {project.data.naming.selectedName === name && (
                            <div className="mt-2 text-indigo-600 text-xs font-semibold flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Selected
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                <Button variant="ghost" onClick={handleGenerate} isLoading={loading}>
                    Regenerate
                </Button>
                {project.data.naming.selectedName && (
                    <Button onClick={onBack} variant="primary">
                        Save & Continue
                    </Button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
