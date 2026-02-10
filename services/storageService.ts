

import { Project, ProjectData } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'launchpad_projects';
const CURRENT_PROJECT_KEY = 'launchpad_current_project_id';

const initialProjectData: ProjectData = {
  idea: {
    description: '',
    targetAudience: '',
    uniqueValueProp: '',
    industry: '',
    skills: '',
    budget: '',
    isComplete: false,
  },
  naming: {
    suggestions: [],
    selectedName: null,
    rationale: '',
  },
  logo: {
    prompt: '',
    imageUrl: null,
    style: 'modern',
  },
  website: {
    sitemap: '',
    heroCopy: '',
    colorPalette: [],
  },
  marketing: {
    strategy: '',
    socialPosts: [],
    checklist: [],
    campaigns: [],
    concepts: [],
  },
  pitchDeck: {
    slides: [],
  },
  boardroom: {
    history: [],
  },
  focusGroup: {
    personas: [],
    history: []
  },
  competitor: {
    nemesis: null,
    marketShare: 50,
    rounds: []
  },
  competitorAnalysis: {
    competitors: [],
    marketSummary: ''
  },
  pivot: {
    pivots: [],
  },
  mockup: {
    html: null,
    lastGenerated: 0,
  },
  mentor: {
    messages: []
  },
  gauntlet: {
    status: 'idle',
    interestLevel: 50,
    history: [],
    feedback: null,
    termSheet: null
  },
  badges: [],
};

export const storageService = {
  // Project Management
  getProjects: (): Project[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load projects', e);
      return [];
    }
  },

  getProject: (id: string): Project | undefined => {
    const projects = storageService.getProjects();
    const project = projects.find((p) => p.id === id);
    // Backward compatibility merge
    if (project) {
        if (!project.data.pitchDeck) project.data.pitchDeck = { slides: [] };
        else if (!project.data.pitchDeck.slides) project.data.pitchDeck.slides = [];

        if (!project.data.pivot) project.data.pivot = { pivots: [] };
        else if (!project.data.pivot.pivots) project.data.pivot.pivots = [];

        if (!project.data.mockup) project.data.mockup = { html: null, lastGenerated: 0 };
        
        if (!project.data.boardroom) project.data.boardroom = { history: [] };
        else if (!project.data.boardroom.history) project.data.boardroom.history = [];

        if (!project.data.focusGroup) project.data.focusGroup = { personas: [], history: [] };
        else {
             if (!project.data.focusGroup.personas) project.data.focusGroup.personas = [];
             if (!project.data.focusGroup.history) project.data.focusGroup.history = [];
        }

        if (!project.data.competitor) project.data.competitor = { nemesis: null, marketShare: 50, rounds: [] };
        else if (!project.data.competitor.rounds) project.data.competitor.rounds = [];

        if (!project.data.competitorAnalysis) project.data.competitorAnalysis = { competitors: [], marketSummary: '' };
        else if (!project.data.competitorAnalysis.competitors) project.data.competitorAnalysis.competitors = [];
        
        if (!project.data.mentor) project.data.mentor = { messages: [] };
        else if (!project.data.mentor.messages) project.data.mentor.messages = [];

        if (!project.data.gauntlet) project.data.gauntlet = { status: 'idle', interestLevel: 50, history: [], feedback: null, termSheet: null };

        if (!project.data.badges) project.data.badges = [];
        
        if (!project.data.idea.industry) {
            project.data.idea.industry = '';
            project.data.idea.skills = '';
            project.data.idea.budget = '';
        }

        if (!project.data.naming) project.data.naming = { suggestions: [], selectedName: null, rationale: '' };
        else if (!project.data.naming.suggestions) project.data.naming.suggestions = [];

        if (!project.data.website) project.data.website = { sitemap: '', heroCopy: '', colorPalette: [] };
        else if (!project.data.website.colorPalette) project.data.website.colorPalette = [];

        if (!project.data.marketing) {
            project.data.marketing = { strategy: '', socialPosts: [], checklist: [], campaigns: [], concepts: [] };
        } else {
             if (!project.data.marketing.campaigns) project.data.marketing.campaigns = [];
             if (!project.data.marketing.checklist) project.data.marketing.checklist = [];
             if (!project.data.marketing.socialPosts) project.data.marketing.socialPosts = [];
             if (!project.data.marketing.concepts) project.data.marketing.concepts = [];
        }
    }
    return project;
  },

  createProject: (name: string): Project => {
    const projects = storageService.getProjects();
    const newProject: Project = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      data: { ...initialProjectData },
    };
    
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    localStorage.setItem(CURRENT_PROJECT_KEY, newProject.id);
    return newProject;
  },

  updateProject: (id: string, updates: Partial<ProjectData>): Project | undefined => {
    const projects = storageService.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    
    if (index === -1) return undefined;

    const updatedProject = {
      ...projects[index],
      lastUpdated: Date.now(),
      data: {
        ...projects[index].data,
        ...updates,
      },
    };

    projects[index] = updatedProject;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return updatedProject;
  },

  renameProject: (id: string, newName: string): Project | undefined => {
    const projects = storageService.getProjects();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) return undefined;

    const updatedProject = {
      ...projects[index],
      name: newName,
      lastUpdated: Date.now(),
    };

    projects[index] = updatedProject;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return updatedProject;
  },

  getCurrentProjectId: (): string | null => {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  },

  setCurrentProjectId: (id: string) => {
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  },

  deleteProject: (id: string) => {
    const projects = storageService.getProjects();
    // Ensure we are comparing IDs correctly as strings
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Always clear current project key if it matches the deleted one
    const currentKey = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (currentKey === id) {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  }
};
