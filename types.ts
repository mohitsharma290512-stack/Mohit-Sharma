

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  lastUpdated: number;
  data: ProjectData;
}

export interface ProjectData {
  idea: IdeaPhase;
  naming: NamingPhase;
  logo: LogoPhase;
  website: WebsitePhase;
  marketing: MarketingPhase;
  pitchDeck: PitchDeckPhase;
  boardroom: BoardroomPhase;
  focusGroup: FocusGroupPhase;
  competitor: CompetitorPhase; // Wargames
  competitorAnalysis: CompetitorAnalysisPhase; // Analysis
  pivot: PivotPhase;
  mockup: MockupPhase;
  mentor: MentorPhase; // New Founder School
  gauntlet: GauntletPhase; // The Gauntlet
  badges: string[];
}

export interface IdeaPhase {
  description: string;
  targetAudience: string;
  uniqueValueProp: string;
  industry: string;
  skills: string;
  budget: string;
  isComplete: boolean;
}

export interface NamingPhase {
  suggestions: string[];
  selectedName: string | null;
  rationale: string;
}

export interface LogoPhase {
  prompt: string;
  imageUrl: string | null;
  style: 'minimal' | 'modern' | 'playful' | 'tech';
}

export interface WebsitePhase {
  sitemap: string; // Markdown
  heroCopy: string;
  colorPalette: string[];
}

export interface Campaign {
  id: string;
  type: string; // e.g. 'Launch', 'Viral', 'Influencer'
  title: string;
  objective: string;
  tactics: string[];
  channels: string[];
  timeline: string;
}

export interface CampaignConcept {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
}

export interface MarketingPhase {
  strategy: string; // Markdown
  socialPosts: string[];
  checklist: string[];
  campaigns: Campaign[];
  concepts: CampaignConcept[];
}

export interface PitchDeckPhase {
  slides: Array<{
    title: string;
    content: string; // Markdown or bullet points
    visualCue: string; // Description of what visual should be on the slide
  }>;
}

export interface BoardroomPhase {
  history: Array<{
    question: string;
    responses: {
      visionary: string;
      growth: string;
      skeptic: string;
    };
    timestamp: number;
  }>;
}

export interface FocusGroupPhase {
  personas: Array<{
    id: string;
    name: string;
    age: number;
    occupation: string;
    bio: string;
    painPoints: string;
  }>;
  history: Array<{
    question: string;
    responses: Record<string, string>; // personaId -> response text
    analysis: string; // Moderator summary
    timestamp: number;
  }>;
}

export interface CompetitorPhase {
  nemesis: {
    name: string;
    tagline: string;
    strength: string;
    weakness: string;
    bio: string;
  } | null;
  marketShare: number; // 0 to 100, starts at 50
  rounds: Array<{
    event: string;
    playerAction: string;
    outcome: string;
    marketShareChange: number;
  }>;
}

export interface Competitor {
  name: string;
  type: 'Direct' | 'Indirect' | 'Future';
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShareEst: number; // 0-100
  differentiator: string; // How user wins
}

export interface CompetitorAnalysisPhase {
  competitors: Competitor[];
  marketSummary: string;
}

export interface PivotPhase {
  pivots: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

export interface MockupPhase {
  html: string | null;
  lastGenerated: number;
}

export interface MentorPhase {
  messages: Array<{
    id: string;
    role: 'user' | 'mentor';
    text: string;
    audioUrl?: string; // Blob URL for TTS
    timestamp: number;
  }>;
}

export interface GauntletPhase {
  status: 'idle' | 'active' | 'funded' | 'rejected';
  interestLevel: number; // 0-100
  history: Array<{
    speaker: 'VC' | 'User';
    name?: string;
    text: string;
  }>;
  feedback: string | null;
  termSheet: {
    valuation: string;
    investment: string;
    equity: string;
  } | null;
}

export type AppView = 'dashboard' | 'intake' | 'naming' | 'logo' | 'website' | 'marketing' | 'pitch-deck' | 'boardroom' | 'focus-group' | 'competitor' | 'competitor-analysis' | 'pivot' | 'mockup' | 'mentor' | 'gauntlet';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  role?: string;
  bio?: string;
}
