import React, { useState } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, MonitorPlay, Code, Download, RefreshCw } from 'lucide-react';

interface MockupViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const MockupView: React.FC<MockupViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const nameToUse = project.data.naming.selectedName || "My Startup";
        // Pass existing color palette if available
        const colors = project.data.website.colorPalette || [];
        
        const result = await geminiService.generateLandingPage(
            project.data.idea, 
            nameToUse, 
            colors
        );
        
        onUpdate({
            mockup: {
                html: result.html,
                lastGenerated: Date.now(),
            }
        });
    } catch (e) {
        console.error(e);
        alert("Error generating mockup. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = () => {
      if (!project.data.mockup.html) return;
      const blob = new Blob([project.data.mockup.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-landing.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const { html } = project.data.mockup;

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Instant Mockup</h2>
        </div>
        <div className="flex gap-2">
            {html && (
                <>
                    <Button variant="outline" onClick={() => setShowCode(!showCode)} title="View Code">
                        <Code className="h-4 w-4 mr-2" /> {showCode ? 'Preview' : 'Code'}
                    </Button>
                    <Button variant="outline" onClick={handleDownload} title="Download HTML">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                </>
            )}
            <Button onClick={handleGenerate} isLoading={loading}>
                {html ? <><RefreshCw className="h-4 w-4 mr-2" /> Regenerate</> : 'Generate Website'}
            </Button>
        </div>
      </div>

      {!html ? (
          <div className="bg-white p-16 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center flex-grow">
             <div className="bg-indigo-50 p-6 rounded-full mb-6">
                <MonitorPlay className="h-16 w-16 text-indigo-500" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Visualize Your Launch</h3>
             <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg">
                Click the button above to generate a fully functional, responsive landing page mockup tailored to your startup idea in seconds.
             </p>
             <Button onClick={handleGenerate} isLoading={loading} size="lg" className="px-8">
                Generate Instant Mockup
             </Button>
          </div>
      ) : (
          <div className="flex-grow bg-slate-900 rounded-xl border-4 border-slate-900 shadow-2xl overflow-hidden relative group">
             {showCode ? (
                 <textarea 
                    className="w-full h-full p-4 bg-slate-800 text-green-400 font-mono text-sm resize-none focus:outline-none"
                    value={html}
                    readOnly
                 />
             ) : (
                 <iframe 
                    title="Website Mockup"
                    srcDoc={html}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts"
                 />
             )}
          </div>
      )}
    </div>
  );
};
