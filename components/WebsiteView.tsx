
import React, { useState } from 'react';
import { Project, ProjectData } from '../types';
import { Button } from './ui/Button';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, Layout, Box, Globe, Layers, Copy, Check, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WebsiteViewProps {
  project: Project;
  onUpdate: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

export const WebsiteView: React.FC<WebsiteViewProps> = ({ project, onUpdate, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'webflow' | 'carrd' | 'wordpress' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const nameToUse = project.data.naming.selectedName || "My Startup";
        const result = await geminiService.generateWebsitePlan(project.data.idea, nameToUse);
        onUpdate({
            website: {
                ...project.data.website,
                sitemap: result.sitemap,
                heroCopy: result.heroCopy,
                colorPalette: result.colorPalette,
            }
        });
    } catch (e) {
        console.error(e);
        alert("Error generating plan.");
    } finally {
        setLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformConfig = (platform: string) => {
      const { description, industry, uniqueValueProp } = project.data.idea;
      const { heroCopy, colorPalette } = project.data.website;
      const startupName = project.data.naming.selectedName || project.name;

      const basePrompt = `I am building a website for a startup called "${startupName}". 
Industry: ${industry}
Target Audience: ${description}
Unique Value Proposition: ${uniqueValueProp}

Please create a landing page with the following structure:
1. Hero Section: Headline "${heroCopy}"
2. Features Section: Highlight 3 key benefits.
3. Testimonials Section.
4. Call to Action.

Color Palette: ${colorPalette?.join(', ') || 'Modern'}.
Style: Modern, Clean, Professional.`;

      switch (platform) {
          case 'webflow':
              return {
                  name: 'Webflow',
                  url: 'https://webflow.com',
                  icon: Layers,
                  description: 'Best for custom, high-end designs. Use their AI generator.',
                  prompt: `${basePrompt}\n\nAct as a Webflow expert. Generate a class naming structure (BEM) and suggested layout using Flexbox/Grid for this site.`
              };
          case 'carrd':
              return {
                  name: 'Carrd',
                  url: 'https://carrd.co',
                  icon: Box,
                  description: 'Perfect for one-page sites. Simple and fast.',
                  prompt: `${basePrompt}\n\nThis is for a one-page site. Keep sections concise and vertical. Suggest standard container widths.`
              };
          case 'wordpress':
              return {
                  name: 'WordPress',
                  url: 'https://wordpress.com',
                  icon: Globe,
                  description: 'Great for content-heavy sites and blogs.',
                  prompt: `${basePrompt}\n\nSuggest a block structure for the Gutenberg editor.`
              };
          default:
              return null;
      }
  };

  const { sitemap, heroCopy, colorPalette } = project.data.website;
  const platformConfig = selectedPlatform ? getPlatformConfig(selectedPlatform) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">Website Planner</h2>
        </div>
        <Button onClick={handleGenerate} isLoading={loading}>
            {sitemap ? 'Regenerate Plan' : 'Generate Plan'}
        </Button>
      </div>

      {!sitemap ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
             <Layout className="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500">Get a sitemap, copy, and color palette tailored to your audience.</p>
          </div>
      ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Sitemap Structure</h3>
                    <div className="prose prose-sm prose-slate">
                        <ReactMarkdown>{sitemap}</ReactMarkdown>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Hero Section Copy</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-slate-700">
                            {heroCopy}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Suggested Palette</h3>
                        <div className="flex gap-4">
                            {colorPalette && colorPalette.map((color, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <div 
                                        className="w-16 h-16 rounded-full shadow-inner border border-slate-100" 
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs font-mono text-slate-500">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* No-Code Integration Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Build with No-Code</h3>
                    <p className="text-slate-500 text-sm mt-1">Select a platform to generate a tailored AI prompt for building your site.</p>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {(['webflow', 'carrd', 'wordpress'] as const).map((p) => {
                            const config = getPlatformConfig(p);
                            if (!config) return null;
                            const Icon = config.icon;
                            const isSelected = selectedPlatform === p;
                            return (
                                <div 
                                    key={p}
                                    onClick={() => setSelectedPlatform(p)}
                                    className={`
                                        cursor-pointer p-4 rounded-lg border text-left transition-all
                                        ${isSelected 
                                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                                            : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
                                    `}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-md ${isSelected ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                                            <Icon className={`h-5 w-5 ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`} />
                                        </div>
                                        <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                            {config.name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {config.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {platformConfig && (
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">AI Builder Prompt for {platformConfig.name}</h4>
                                    <p className="text-xs text-slate-500">Copy this into {platformConfig.name}'s AI assistant or use as a blueprint.</p>
                                </div>
                                <div className="flex gap-2">
                                    <a 
                                        href={platformConfig.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                                    >
                                        Open {platformConfig.name} <ExternalLink className="ml-2 h-3 w-3" />
                                    </a>
                                    <Button size="sm" onClick={() => handleCopyPrompt(platformConfig.prompt)} variant={copied ? 'secondary' : 'primary'}>
                                        {copied ? <><Check className="mr-2 h-3 w-3" /> Copied</> : <><Copy className="mr-2 h-3 w-3" /> Copy Prompt</>}
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                                    {platformConfig.prompt}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </>
      )}
    </div>
  );
};
