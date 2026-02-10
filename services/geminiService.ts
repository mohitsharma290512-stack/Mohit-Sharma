


import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProjectData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get text from response safely
const getText = (response: any) => {
    return response.text || '';
};

// Helper to strip code fences if needed, though mostly we want to parse JSON
const parseJson = (text: string) => {
    try {
        // Remove markdown code blocks if present (e.g. ```json ... ```)
        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", text);
        throw new Error("Failed to parse AI response");
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper for AI calls with retry logic for Rate Limits (429)
const runAI = async (params: any) => {
    const retries = 3;
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (e: any) {
             const isRateLimit = e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('quota');
             if (isRateLimit && i < retries - 1) {
                 const waitTime = 2000 * Math.pow(2, i); // 2s, 4s, 8s
                 console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
                 await delay(waitTime); 
                 continue;
             }
             throw e;
        }
    }
    throw new Error("AI Request Failed after retries");
};

// Basic decoding for Audio (from Base64)
const decodeAudioData = async (base64String: string, audioContext: AudioContext) => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // This decodeAudioData is asynchronous
  return await audioContext.decodeAudioData(bytes.buffer);
};

export const geminiService = {
  /**
   * General Chat Assistant
   */
  chatWithAssistant: async (message: string, projectContext?: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const contextStr = projectContext 
        ? `The user is currently working on a project with this context: ${projectContext}` 
        : "The user has not started a project yet.";

    const prompt = `
        You are the LaunchPad AI Assistant, a helpful mentor for startup founders.
        ${contextStr}

        The user asks: "${message}"

        Provide a helpful, encouraging, and concise answer (under 100 words). 
        If they ask about the app features, explain that:
        - 'Naming' helps find business names.
        - 'Logo' generates visual identities.
        - 'Boardroom' simulates advisor feedback.
        - 'Wargames' simulates competitor battles.
    `;

    const response = await runAI({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    });

    return getText(response);
  },

  /**
   * Generates a startup idea (random or based on input).
   */
  generateStartupIdea: async (topic?: string, industry?: string, audience?: string) => {
    if (!apiKey) throw new Error("API Key missing");

    let context = `Generate a detailed, viable startup idea`;
    if (topic) context += ` based on the topic/problem: "${topic}"`;
    if (industry) context += ` within the "${industry}" industry`;
    if (audience) context += ` targeting "${audience}"`;
    
    if (!topic && !industry && !audience) {
        context += ` that is currently trending, unique, and high-potential`;
    }

    const prompt = `
      Act as a startup ideator.
      ${context}.
      
      Return JSON:
      {
        "description": "Full description of the idea (2-3 sentences)",
        "targetAudience": "Specific target audience details",
        "uniqueValueProp": "The killer feature / main differentiator",
        "industry": "Industry niche",
        "skills": "Required skills (e.g. Dev, Sales)",
        "budget": "Estimated MVP budget"
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
                uniqueValueProp: { type: Type.STRING },
                industry: { type: Type.STRING },
                skills: { type: Type.STRING },
                budget: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates business name ideas based on the project idea.
   */
  generateNames: async (idea: ProjectData['idea']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      You are a creative branding expert.
      I have a startup idea:
      Description: ${idea.description}
      Target Audience: ${idea.targetAudience}
      Industry: ${idea.industry}
      USP: ${idea.uniqueValueProp}
      
      Please generate 5 creative, memorable, and available-sounding business names.
      Also provide a 1-sentence rationale for the overall naming direction.
      
      Return JSON format:
      {
        "names": ["Name1", "Name2", ...],
        "rationale": "We focused on..."
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                names: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                rationale: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates a logo prompt description and then the actual image.
   */
  generateLogo: async (idea: ProjectData['idea'], name: string, style: string) => {
    if (!apiKey) throw new Error("API Key missing");

    // Step 1: Generate a detailed visual prompt for the image model
    const promptGenerationResponse = await runAI({
      model: 'gemini-3-flash-preview',
      contents: `
        Create a detailed text-to-image prompt for a modern startup logo.
        Startup Name: ${name}
        Description: ${idea.description}
        Industry: ${idea.industry}
        Style: ${style} (e.g. minimalist, bold, abstract)
        
        The prompt should be descriptive, mentioning colors, shapes, and composition. 
        Keep it under 50 words.
        Output ONLY the prompt text.
      `
    });
    
    const imagePrompt = getText(promptGenerationResponse);

    // Step 2: Generate the image
    const imageResponse = await runAI({
      model: 'gemini-2.5-flash-image',
      contents: {
          parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: '1:1',
        }
      }
    });

    // Extract image
    let imageUrl = null;
    const parts = imageResponse.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    return { prompt: imagePrompt, imageUrl };
  },

  /**
   * Generates website structure and content.
   */
  generateWebsitePlan: async (idea: ProjectData['idea'], name: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a web strategist. 
      Project: ${name}
      Context: ${idea.description}
      Industry: ${idea.industry}
      
      1. Create a simple 5-section sitemap (e.g. Hero, Features, Testimonials...).
      2. Write compelling Hero Section copy (Headline & Subheadline).
      3. Suggest a color palette (3 hex codes with names).

      Return JSON.
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                sitemap: { type: Type.STRING, description: "Markdown list of sections" },
                heroCopy: { type: Type.STRING },
                colorPalette: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates marketing strategy and checklist.
   */
  generateMarketing: async (idea: ProjectData['idea'], name: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a digital marketing expert for ${name}.
      Audience: ${idea.targetAudience}
      Industry: ${idea.industry}
      Budget: ${idea.budget}
      
      1. Write a 3-point High Level Strategy (Markdown).
      2. Write 3 example social media posts (LinkedIn/Twitter style).
      3. Create a 5-item prioritized Launch Checklist.
      
      Return JSON.
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                strategy: { type: Type.STRING },
                socialPosts: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                },
                checklist: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of actionable launch steps."
                }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates creative campaign concepts.
   */
  brainstormCampaigns: async (idea: ProjectData['idea'], campaignType: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a creative marketing director.
      Startup Description: ${idea.description}
      Target Audience: ${idea.targetAudience}
      
      Brainstorm 3 distinct, creative, and actionable "${campaignType}" campaign concepts.
      
      Return JSON:
      {
        "concepts": [
          {
            "title": "Catchy Name",
            "description": "One sentence pitch of the idea.",
            "impact": "High/Medium/Low"
          }
        ]
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                concepts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            impact: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates a detailed campaign based on a specific type and optional concept.
   */
  generateCampaign: async (idea: ProjectData['idea'], name: string, campaignType: string, specificConcept?: string) => {
    if (!apiKey) throw new Error("API Key missing");

    let context = `
      Startup: ${name}
      Description: ${idea.description}
      Target Audience: ${idea.targetAudience}`;
      
    if (specificConcept) {
        context += `\nFocus specifically on this creative concept: ${specificConcept}`;
    }

    const prompt = `
      Act as a marketing director. Create a specific, actionable ${campaignType} campaign plan.
      ${context}

      The plan should be detailed and ready to execute.
      
      Return JSON:
      {
        "title": "Creative Campaign Title",
        "objective": "What is the main goal?",
        "tactics": ["Step-by-step tactical actions to take", "...", "..."],
        "channels": ["List of best channels for this"],
        "timeline": "e.g. 2 Weeks"
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                objective: { type: Type.STRING },
                tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
                channels: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates an investor pitch deck outline.
   */
  generatePitchDeck: async (idea: ProjectData['idea'], name: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a venture capital consultant.
      Create a 10-slide investor pitch deck outline for:
      Startup Name: ${name}
      Description: ${idea.description}
      Target Audience: ${idea.targetAudience}
      Industry: ${idea.industry}
      
      For each slide, provide a Title, Key Content Points (as a short markdown list), and a Visual Cue (what image/chart should go there).
      Standard Flow: Problem, Solution, Market, Product, Business Model, etc.

      Return JSON.
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                slides: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            content: { type: Type.STRING },
                            visualCue: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates surprise pivots.
   */
  generatePivots: async (idea: ProjectData['idea']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a disruptive startup mentor.
      Take this idea:
      Description: ${idea.description}
      Industry: ${idea.industry}
      
      Generate 3 distinct "Pivot" directions to spark inspiration:
      1. 'The Moonshot': How to scale this to a billion-dollar company (high risk/reward).
      2. 'The Niche': How to focus on a tiny, underserved hyper-specific market.
      3. 'The Wildcard': A completely unexpected angle (e.g. change the business model, medium, or core mechanic).

      Return JSON.
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                pivots: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates a complete HTML landing page.
   */
  generateLandingPage: async (idea: ProjectData['idea'], name: string, colors: string[]) => {
    if (!apiKey) throw new Error("API Key missing");

    const colorInstruction = colors.length > 0 
        ? `Use these colors if appropriate: ${colors.join(', ')}.` 
        : 'Use a modern, professional color scheme.';

    const prompt = `
      Act as a senior Frontend Developer and UI Designer.
      Create a high-converting, single-page Landing Page for a startup.

      Startup Name: ${name}
      Description: ${idea.description}
      Target Audience: ${idea.targetAudience}
      Industry: ${idea.industry}
      Design Instructions: ${colorInstruction}

      Requirements:
      1. Use HTML5 and Tailwind CSS (loaded via CDN).
      2. Include these sections: Navbar, Hero (with headline/CTA), Features (3-grid), Testimonials, Pricing (optional), Footer.
      3. Use 'https://source.unsplash.com/random/800x600/?business,tech' (or specific keywords related to the idea) for placeholder images.
      4. Make it look fully polished, responsive, and ready to publish.
      5. Do not include markdown code fences (like \`\`\`html). Return ONLY the raw HTML string inside a JSON object.

      Return JSON format:
      {
        "html": "<!DOCTYPE html><html>..."
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                html: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * One-click generation of a complete plan.
   * Runs sequentially to avoid rate limits and handles partial failures.
   */
  generateFullPlan: async (idea: ProjectData['idea']) => {
    // Initialize results with empty defaults so we can return whatever we get
    let namingResult: any = { names: [], rationale: '' };
    let logoResult: any = { prompt: '', imageUrl: null };
    let websiteResult: any = { sitemap: '', heroCopy: '', colorPalette: [] };
    let marketingResult: any = { strategy: '', socialPosts: [], checklist: [] };

    // 1. Generate Name First
    try {
        namingResult = await geminiService.generateNames(idea);
    } catch (e) {
        console.warn("Naming generation failed", e);
    }
    const selectedName = namingResult.names?.[0] || 'My Startup';

    // 2. Generate other assets sequentially
    // Increased delay to 2s to be safer against 60 RPM limits if many users
    await delay(2000);
    
    try {
        logoResult = await geminiService.generateLogo(idea, selectedName, 'modern');
    } catch (e) {
        console.warn("Logo generation failed", e);
    }
    
    await delay(2000);
    
    try {
        websiteResult = await geminiService.generateWebsitePlan(idea, selectedName);
    } catch (e) {
        console.warn("Website generation failed", e);
    }
    
    await delay(2000);
    
    try {
        marketingResult = await geminiService.generateMarketing(idea, selectedName);
    } catch (e) {
        console.warn("Marketing generation failed", e);
    }

    return {
      naming: {
        suggestions: namingResult.names || [],
        selectedName: selectedName !== 'My Startup' ? selectedName : null,
        rationale: namingResult.rationale || ''
      },
      logo: {
        prompt: logoResult.prompt || '',
        imageUrl: logoResult.imageUrl || null,
        style: 'modern'
      },
      website: {
        sitemap: websiteResult.sitemap || '',
        heroCopy: websiteResult.heroCopy || '',
        colorPalette: websiteResult.colorPalette || []
      },
      marketing: {
        strategy: marketingResult.strategy || '',
        socialPosts: marketingResult.socialPosts || [],
        checklist: marketingResult.checklist || []
      }
    };
  },

  /**
   * Asks the virtual advisory board for advice.
   */
  askBoardroom: async (idea: ProjectData['idea'], name: string, question: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      You are simulating a Board of Advisors for a startup called "${name}".
      Context: ${idea.description}
      
      The user asks: "${question}"
      
      Provide 3 distinct responses from these personas:
      1. 'The Visionary' (Steve): Bold, future-focused, obsessed with product perfection and design.
      2. 'The Growth Hacker' (Marcus): Obsessed with speed, traction, sales, and marketing loops.
      3. 'The Skeptic' (Linda): A risk-averse VC. Focuses on unit economics, burn rate, and competition. Point out flaws.
      
      Keep each response under 60 words. Be conversational.
      
      Return JSON:
      {
        "visionary": "...",
        "growth": "...",
        "skeptic": "..."
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                visionary: { type: Type.STRING },
                growth: { type: Type.STRING },
                skeptic: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates 3 customer personas for the Focus Group.
   */
  generateFocusGroupPersonas: async (idea: ProjectData['idea']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      I need to recruit a Synthetic Focus Group for a startup idea.
      Idea: ${idea.description}
      Target Audience: ${idea.targetAudience}
      
      Create 3 distinct user personas that represent different segments of this audience.
      They should have different ages, backgrounds, and levels of skepticism.
      
      Return JSON:
      {
        "personas": [
          {
            "id": "persona1",
            "name": "First Name",
            "age": 25,
            "occupation": "Job Title",
            "bio": "Short 1-sentence bio.",
            "painPoints": "What frustrates them."
          }
        ]
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                personas: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            age: { type: Type.INTEGER },
                            occupation: { type: Type.STRING },
                            bio: { type: Type.STRING },
                            painPoints: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Conducts a focus group session where personas answer a question.
   */
  runFocusGroupSession: async (idea: ProjectData['idea'], personas: any[], question: string) => {
    if (!apiKey) throw new Error("API Key missing");

    // Include ID explicitly to help the model map responses back correctly
    const personasContext = personas.map(p => 
        `ID: ${p.id} | Name: ${p.name} (${p.age}, ${p.occupation}): ${p.bio}. Pain points: ${p.painPoints}`
    ).join('\n');

    const prompt = `
      Act as a focus group moderator and the participants.
      Startup Idea: ${idea.description}
      
      Participants:
      ${personasContext}
      
      The user asks the group: "${question}"
      
      Tasks:
      1. Provide a response from EACH participant. They should stay in character.
      2. Provide a short "Moderator Summary" analyzing the consensus.
      
      Return JSON using this structure (array of responses):
      {
        "responses": [
            { "id": "persona1", "text": "..." },
            { "id": "persona2", "text": "..." },
            { "id": "persona3", "text": "..." }
        ],
        "analysis": "..."
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                responses: { 
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING }
                        }
                    }
                },
                analysis: { type: Type.STRING }
            }
        }
      }
    });

    const json = parseJson(getText(response));

    // Transform array back to Record<string, string> for the frontend component
    const responsesRecord: Record<string, string> = {};
    if (json.responses && Array.isArray(json.responses)) {
        json.responses.forEach((r: any) => {
            if (r.id && r.text) {
                responsesRecord[r.id] = r.text;
            }
        });
    }

    return {
        responses: responsesRecord,
        analysis: json.analysis
    };
  },

  /**
   * Creates a Nemesis competitor for the Wargames feature.
   */
  generateNemesis: async (idea: ProjectData['idea']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Analyze this startup idea and create a direct "Nemesis" competitor.
      The Nemesis should be the "Anti-Thesis" or a "Better Funded" version of the user's idea.
      Idea: ${idea.description}
      Industry: ${idea.industry}
      
      Return JSON:
      {
        "name": "Competitor Name",
        "tagline": "Short aggressive tagline",
        "bio": "How they plan to crush the user's startup.",
        "strength": "Their main advantage (e.g. Money, Tech, Speed)",
        "weakness": "Their fatal flaw"
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                tagline: { type: Type.STRING },
                bio: { type: Type.STRING },
                strength: { type: Type.STRING },
                weakness: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Generates a market event for wargames.
   */
  generateWargameEvent: async (idea: ProjectData['idea'], nemesis: any, roundNumber: number) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Turn-based Business Wargame. Round ${roundNumber}.
      User Idea: ${idea.description}
      Nemesis: ${nemesis.name} (${nemesis.bio}).
      
      Generate a threatening market event initiated by the Nemesis or the market itself.
      It should require a strategic response from the user.
      Examples: "Nemesis raised $5M", "A key API you rely on doubled prices", "Nemesis copied your top feature".
      
      Return JSON:
      {
        "event": "Description of what happened..."
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                event: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Resolves a wargame turn based on user action.
   */
  resolveWargameTurn: async (idea: ProjectData['idea'], nemesis: any, event: string, userAction: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Judge this Business Wargame turn.
      User Idea: ${idea.description}
      Nemesis: ${nemesis.name} (Strength: ${nemesis.strength}).
      
      Event: ${event}
      User Response: ${userAction}
      
      Did the user make a smart move? 
      Calculate the shift in "Market Share" (User starts at 50%).
      - Good strategic move: User gains +1 to +10%.
      - Bad/Weak move: User loses -1 to -10%.
      - Neutral: 0.
      
      Return JSON:
      {
        "outcome": "Narrative description of what happened next.",
        "marketShareChange": integer (e.g. -5 or 8)
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                outcome: { type: Type.STRING },
                marketShareChange: { type: Type.INTEGER }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Analyzes the competitive landscape.
   */
  analyzeCompetitors: async (idea: ProjectData['idea']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a market research analyst.
      Analyze the industry for this startup idea:
      Description: ${idea.description}
      Industry: ${idea.industry}
      
      1. Identify 4 potential competitor archetypes or real existing companies.
      2. For each, identify their Strengths (SWOT), Weaknesses (SWOT), and estimated market dominance (1-100%).
      3. Provide a 'Strategic Differentiator' - how the user can win against them.
      4. Provide a short 2-sentence 'Market Summary' of the overall landscape.

      Return JSON.
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                competitors: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['Direct', 'Indirect', 'Future'] },
                            description: { type: Type.STRING },
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                            marketShareEst: { type: Type.INTEGER },
                            differentiator: { type: Type.STRING }
                        }
                    }
                },
                marketSummary: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Starts the Gauntlet simulation.
   */
  startGauntlet: async (idea: ProjectData['idea']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
      Act as a skeptical Venture Capitalist (VC).
      You are about to hear a pitch for a startup.
      
      Startup Idea: ${idea.description}
      Target Audience: ${idea.targetAudience}
      Industry: ${idea.industry}
      
      Start the meeting by introducing yourself as "The Shark" and asking a tough, direct opening question about the business viability.
      
      Return JSON:
      {
        "text": "..."
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING }
            }
        }
      }
    });

    return parseJson(getText(response));
  },

  /**
   * Runs a turn in the Gauntlet simulation.
   */
  runGauntletTurn: async (idea: ProjectData['idea'], history: any[], userMessage: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const historyText = history.map(h => `${h.speaker === 'User' ? 'Founder' : 'VC'}: ${h.text}`).join('\n');

    const prompt = `
      Simulation: "The Gauntlet" - A high stakes VC pitch.
      Startup: ${idea.description}
      
      Conversation History:
      ${historyText}
      
      Founder just said: "${userMessage}"
      
      Tasks:
      1. Analyze the founder's response. Is it convincing?
      2. Choose the next VC to speak: "The Shark" (Aggressive), "The Angel" (Supportive but inquisitive), or "The Analyst" (Numbers focused).
      3. Determine the shift in Interest Level (-100 to +100). 
         - Good answers gain +5 to +15. 
         - Bad/Vague answers lose -5 to -15.
      4. If Interest Level is very high (simulated), offer a Term Sheet.
      5. If Interest Level is very low, Reject the startup.
      
      Return JSON:
      {
        "responseText": "The VC's response question or statement.",
        "nextSpeakerName": "Name of VC (e.g. The Shark)",
        "interestChange": integer,
        "isGameOver": boolean,
        "feedback": "If game over, provide specific feedback on why they won or lost.",
        "termSheet": {
            "valuation": "N/A or $X",
            "investment": "N/A or $Y",
            "equity": "N/A or Z%"
        }
      }
    `;

    const response = await runAI({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                responseText: { type: Type.STRING },
                nextSpeakerName: { type: Type.STRING },
                interestChange: { type: Type.INTEGER },
                isGameOver: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING },
                termSheet: {
                     type: Type.OBJECT,
                     properties: {
                         valuation: { type: Type.STRING },
                         investment: { type: Type.STRING },
                         equity: { type: Type.STRING }
                     }
                }
            }
        }
      }
    });

    const result = parseJson(getText(response));

    // Post-process termSheet: if valuation is "N/A", treat as null
    if (result.termSheet && (result.termSheet.valuation === 'N/A' || result.termSheet.valuation === '')) {
        result.termSheet = null;
    }

    return result;
  },

  /**
   * Mentor Chat Logic (Teacher Mode)
   */
  chatWithMentor: async (idea: ProjectData['idea'], history: any[], userMessage: string) => {
      if (!apiKey) throw new Error("API Key missing");
      
      const context = history.map(h => `${h.role}: ${h.text}`).join('\n');
      
      const prompt = `
        You are a world-class Startup Mentor and Teacher (Think Y-Combinator Partner meets First Principles thinker).
        The user has a startup idea:
        Description: ${idea.description}
        Target Audience: ${idea.targetAudience}
        
        Your goal is to TEACH the user how to build this specific business. 
        - Do not just be a chatbot. be a guide.
        - Ask Socratic questions to make them think.
        - Explain concepts like "Product Market Fit", "CAC/LTV", or "Moats" in the context of THEIR idea.
        - Be encouraging but realistic.
        
        Conversation History:
        ${context}
        
        User: ${userMessage}
        
        Reply as the Mentor. Keep it conversational (2-3 sentences max usually).
      `;

      const response = await runAI({
          model: 'gemini-3-flash-preview',
          contents: prompt
      });
      
      return getText(response);
  },

  /**
   * Text to Speech Generation
   */
  generateSpeech: async (text: string) => {
      if (!apiKey) throw new Error("API Key missing");

      const response = await runAI({
          model: "gemini-2.5-flash-preview-tts",
          contents: {
              parts: [{ text }]
          },
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
              },
          },
      });
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts && parts[0]?.inlineData?.data) {
          // Convert base64 to blob url for playback
          const base64Audio = parts[0].inlineData.data;
          // Return base64 for decoding in component
          return base64Audio;
      }
      return null;
  }
};
