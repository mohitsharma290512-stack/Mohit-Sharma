import React, { useState } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface LogoViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const LogoView: React.FC<LogoViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState(project.data.logo.style);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
        const nameToUse = project.data.naming.selectedName || "My Startup";
        const result = await geminiService.generateLogo(
            project.data.idea, 
            nameToUse,
            style
        );
        onUpdate({
            logo: {
                ...project.data.logo,
                prompt: result.prompt,
                imageUrl: result.imageUrl,
                style: style as any,
            }
        });
    } catch (e) {
        console.error(e);
        alert("Failed to generate logo. Ensure API key is set.");
    } finally {
        setLoading(false);
    }
  };

  const { imageUrl, prompt } = project.data.logo;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">Design Your Logo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Logo Style</label>
                <div className="space-y-2">
                    {['minimal', 'modern', 'playful', 'tech'].map((s) => (
                        <div 
                            key={s}
                            onClick={() => setStyle(s as any)}
                            className={`
                                p-3 rounded-lg border cursor-pointer capitalize text-sm font-medium transition-colors
                                ${style === s 
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}
                            `}
                        >
                            {s}
                        </div>
                    ))}
                </div>
                <Button onClick={handleGenerate} isLoading={loading} className="w-full mt-6">
                    {imageUrl ? 'Regenerate Logo' : 'Generate Logo'}
                </Button>
            </div>
        </div>

        {/* Preview */}
        <div className="col-span-1 md:col-span-2">
            <div className="bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[400px] p-8">
                {imageUrl ? (
                    <div className="text-center w-full">
                        <img 
                            src={imageUrl} 
                            alt="Generated Logo" 
                            className="w-64 h-64 object-contain mx-auto rounded-lg shadow-lg bg-white mb-6" 
                        />
                        <div className="bg-white p-4 rounded-lg border border-slate-200 text-left w-full">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">AI Prompt Used</h4>
                            <p className="text-sm text-slate-700">{prompt}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Select a style and click Generate to see magic happen.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
