import { Lead, Customer, Activity, Task } from './mockData';

// Let's grab API keys from environment or client storage if input on settings page
const getGeminiApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('salesmind_gemini_key');
    if (customKey) return customKey;
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
};

// Directly make HTTP request to Gemini API to avoid dependency issues
const callGeminiAPI = async (prompt: string, fallbackJson: any): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      const err = await response.text();
      console.warn("Gemini API error response:", err);
      throw new Error("Failed response from Gemini API");
    }
    
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Empty candidate result from Gemini.");
    }
    return resultText;
  } catch (error) {
    console.error("Gemini API call failed, using mock generator:", error);
    return JSON.stringify(fallbackJson);
  }
};

// ==========================================
// 1. AI LEAD SCORING
// ==========================================

export interface LeadScoreResponse {
  score: number;
  conversionProbability: number;
  reasoning: string;
}

export const analyzeLeadScore = async (lead: Lead, activities: Activity[]): Promise<LeadScoreResponse> => {
  const apiKey = getGeminiApiKey();
  
  const activitiesStr = activities.map(a => `[${a.date}] ${a.type}: ${a.description}`).join('\n');
  
  const prompt = `
    You are an expert CRM sales analysis AI. Analyze the following lead profile and activity history:
    
    LEAD PROFILE:
    Name: ${lead.name}
    Company: ${lead.company}
    Industry: ${lead.industry}
    Source: ${lead.source}
    Status: ${lead.status}
    Notes: ${lead.notes}
    
    ACTIVITY HISTORY:
    ${activitiesStr || 'No activities logged yet.'}
    
    Based on this data, compute:
    1. A lead quality score between 0 and 100.
    2. A conversion probability percentage between 0 and 100.
    3. A brief, 2-sentence summary explaining your reasoning.
    
    Return ONLY a valid JSON object matching this structure:
    {
      "score": 85,
      "conversionProbability": 78,
      "reasoning": "Explain reason here."
    }
  `;
  
  // High-fidelity fallback logic
  let baseScore = 50;
  if (lead.status === 'won') baseScore = 100;
  else if (lead.status === 'lost') baseScore = 5;
  else if (lead.status === 'negotiation') baseScore = 90;
  else if (lead.status === 'qualified') baseScore = 80;
  else if (lead.status === 'interested') baseScore = 70;
  else if (lead.status === 'contacted') baseScore = 55;
  
  // Adjust based on source and activities
  if (lead.source === 'Website' || lead.source === 'Referral') baseScore += 8;
  if (activities.length > 2) baseScore += 7;
  if (lead.notes.toLowerCase().includes('demo') || lead.notes.toLowerCase().includes('budget')) baseScore += 5;
  
  const finalScore = Math.min(Math.max(baseScore, 0), 100);
  const finalProb = Math.min(Math.max(Math.floor(finalScore * 0.95), 0), 100);
  
  const fallbackJson: LeadScoreResponse = {
    score: finalScore,
    conversionProbability: finalProb,
    reasoning: `Lead shows strong interest through the ${lead.source} channel. Activity tracking logs ${activities.length} successful touches, indicating progressive momentum towards status: '${lead.status}'.`
  };
  
  if (!apiKey) {
    // Return mock after small delay
    await new Promise(r => setTimeout(r, 600));
    return fallbackJson;
  }
  
  try {
    const text = await callGeminiAPI(prompt, fallbackJson);
    // Extract JSON from response (handling potential markdown wrapper)
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr) as LeadScoreResponse;
  } catch {
    return fallbackJson;
  }
};

// ==========================================
// 2. AI SALES COACH
// ==========================================

export interface CoachRecommendation {
  id: string;
  leadName: string;
  leadId: string;
  stagnantDays: number;
  recommendation: string;
  expectedIncrease: number;
}

export const getCoachRecommendations = async (leads: Lead[]): Promise<CoachRecommendation[]> => {
  // Filter leads that are not 'won', 'lost' or 'new' to see what needs follow up
  const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost');
  
  const list = activeLeads.map((l, i) => {
    // Mocking stagnant days based on lead creation
    const createdDate = new Date(l.createdAt);
    const diffTime = Math.abs(Date.now() - createdDate.getTime());
    const stagnantDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;
    
    let recommendation = '';
    let expectedIncrease = 10;
    
    if (l.status === 'negotiation') {
      recommendation = `Send pricing confirmation or schedule SLA review today to secure signatures.`;
      expectedIncrease = 18;
    } else if (l.status === 'qualified') {
      recommendation = `Reach out with a calendar link to set up the technical deep dive demo.`;
      expectedIncrease = 15;
    } else if (l.status === 'interested') {
      recommendation = `Follow up with case studies relevant to the ${l.industry} industry.`;
      expectedIncrease = 12;
    } else {
      recommendation = `Initiate introductory discovery call. Send customized services overview email.`;
      expectedIncrease = 8;
    }
    
    return {
      id: `coach_${l.leadId}`,
      leadName: l.name,
      leadId: l.leadId,
      stagnantDays,
      recommendation,
      expectedIncrease
    };
  });
  
  return list.sort((a, b) => b.expectedIncrease - a.expectedIncrease).slice(0, 3);
};

// ==========================================
// 3. AI MEETING SUMMARIZER
// ==========================================

export interface MeetingSummaryResponse {
  summary: string;
  keyDecisions: string[];
  requirements: string[];
  actionItems: {
    item: string;
    assignee: string;
    dueDate: string;
  }[];
  nextMeetingDate: string;
}

export const generateMeetingSummary = async (transcript: string): Promise<MeetingSummaryResponse> => {
  const apiKey = getGeminiApiKey();
  
  const prompt = `
    You are an AI meeting summarization assistant. Analyze the following meeting transcript/notes:
    
    ${transcript}
    
    Generate:
    1. A clear high-level executive summary of the meeting.
    2. A list of key decisions made.
    3. Core customer requirements specified.
    4. A list of concrete action items, guessing logical assignees and deadlines.
    5. Expected next meeting date.
    
    Return ONLY a valid JSON object matching this structure:
    {
      "summary": "Executive summary...",
      "keyDecisions": ["Decision 1", "Decision 2"],
      "requirements": ["Requirement 1", "Requirement 2"],
      "actionItems": [
        { "item": "Do something", "assignee": "Sarah", "dueDate": "2026-06-15" }
      ],
      "nextMeetingDate": "2026-06-20"
    }
  `;
  
  const fallbackJson: MeetingSummaryResponse = {
    summary: "The meeting focused on scoping Wayne Enterprises' custom cloud deployment and security guidelines. Standard package integration terms were approved, subject to SLA validation.",
    keyDecisions: [
      "Agreed to proceed with the core Enterprise Suite installation by Q3.",
      "Security compliance protocols will align with GDPR and SOC2 frameworks."
    ],
    requirements: [
      "Data must be encrypted at rest and in transit.",
      "Access logs must be exportable in real-time to internal audit systems."
    ],
    actionItems: [
      { item: "Finalize customized licensing cost spreadsheet", assignee: "John Doe", dueDate: "2026-06-15" },
      { item: "Draft and transmit Service Level Agreement (SLA)", assignee: "Sarah Connor", dueDate: "2026-06-18" }
    ],
    nextMeetingDate: "2026-06-22"
  };
  
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 1200));
    return fallbackJson;
  }
  
  try {
    const text = await callGeminiAPI(prompt, fallbackJson);
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr) as MeetingSummaryResponse;
  } catch {
    return fallbackJson;
  }
};

// ==========================================
// 4. AI REVENUE FORECASTING
// ==========================================

export interface RevenueForecastResponse {
  expectedRevenue30Days: number;
  expectedRevenue90Days: number;
  confidenceScore: number;
  analysis: string;
}

export const generateRevenueForecast = async (leads: Lead[]): Promise<RevenueForecastResponse> => {
  const apiKey = getGeminiApiKey();
  
  // Calculate mock forecasted metrics based on pipeline
  const wonValue = 850000;
  const negotiationValue = leads.filter(l => l.status === 'negotiation').length * 150000;
  const qualifiedValue = leads.filter(l => l.status === 'qualified').length * 100000;
  const interestedValue = leads.filter(l => l.status === 'interested').length * 50000;
  
  const expectedRevenue30Days = Math.floor(wonValue * 0.1 + negotiationValue * 0.7 + qualifiedValue * 0.4);
  const expectedRevenue90Days = Math.floor(expectedRevenue30Days * 2.8);
  
  const prompt = `
    You are a predictive revenue forecasting AI. Analyze the following pipeline of active leads:
    ${JSON.stringify(leads.map(l => ({ name: l.name, status: l.status, score: l.score, industry: l.industry })))}
    
    Predict expected sales closing revenue for the next 30 days and 90 days. Rate confidence score (0-100).
    Provide a 3-sentence market/pipeline growth synthesis.
    
    Return ONLY a valid JSON object matching this structure:
    {
      "expectedRevenue30Days": 1250000,
      "expectedRevenue90Days": 3500000,
      "confidenceScore": 85,
      "analysis": "Pipeline analysis..."
    }
  `;
  
  const fallbackJson: RevenueForecastResponse = {
    expectedRevenue30Days,
    expectedRevenue90Days,
    confidenceScore: 82,
    analysis: `Next 30-day forecast stands at ₹${expectedRevenue30Days.toLocaleString('en-IN')}, driven strongly by high-probability conversion rates (70%) of leads in 'negotiation' status like Diana Prince. Industry metrics indicate software and logistics sectors dominate our pipeline closing opportunities.`
  };
  
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 900));
    return fallbackJson;
  }
  
  try {
    const text = await callGeminiAPI(prompt, fallbackJson);
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr) as RevenueForecastResponse;
  } catch {
    return fallbackJson;
  }
};
