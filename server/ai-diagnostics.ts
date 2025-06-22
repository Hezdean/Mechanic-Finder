import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

interface DiagnosticRequest {
  symptoms: string;
  vehicle: string;
  context?: string;
}

interface DiagnosticResponse {
  possibleCauses: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedActions: string[];
  estimatedCost: string;
  shouldSeeMechanic: boolean;
}

export async function getDiagnostics(request: DiagnosticRequest): Promise<DiagnosticResponse> {
  if (!openai) {
    // Fallback response when OpenAI is not configured
    return getFallbackDiagnostics(request);
  }

  try {
    const prompt = `You are an expert automotive diagnostic assistant. Analyze the following vehicle issue and provide structured diagnostic information.

Vehicle: ${request.vehicle}
Symptoms: ${request.symptoms}
${request.context ? `Additional Context: ${request.context}` : ''}

Please provide a JSON response with:
1. possibleCauses: Array of potential causes (up to 5 most likely)
2. urgencyLevel: one of "low", "medium", "high", or "emergency"
3. recommendedActions: Array of immediate actions the user can take
4. estimatedCost: String with cost range estimate
5. shouldSeeMechanic: Boolean indicating if professional help is needed

Format your response as valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert automotive diagnostic assistant. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response structure
    if (!result.possibleCauses || !result.urgencyLevel || !result.recommendedActions) {
      return getFallbackDiagnostics(request);
    }

    return result as DiagnosticResponse;
  } catch (error) {
    console.error('AI Diagnostics error:', error);
    return getFallbackDiagnostics(request);
  }
}

function getFallbackDiagnostics(request: DiagnosticRequest): DiagnosticResponse {
  // Basic rule-based diagnostics as fallback
  const symptoms = request.symptoms.toLowerCase();
  
  if (symptoms.includes('smoke') || symptoms.includes('fire') || symptoms.includes('leak')) {
    return {
      possibleCauses: ['Fluid leak', 'Overheating engine', 'Electrical issue'],
      urgencyLevel: 'emergency',
      recommendedActions: ['Stop driving immediately', 'Turn off engine', 'Call for emergency assistance'],
      estimatedCost: '$200 - $1500',
      shouldSeeMechanic: true
    };
  }

  if (symptoms.includes('noise') || symptoms.includes('sound') || symptoms.includes('grinding')) {
    return {
      possibleCauses: ['Brake pad wear', 'Belt issues', 'Engine problems'],
      urgencyLevel: 'medium',
      recommendedActions: ['Schedule inspection soon', 'Avoid hard braking', 'Monitor the issue'],
      estimatedCost: '$100 - $800',
      shouldSeeMechanic: true
    };
  }

  if (symptoms.includes('start') || symptoms.includes('battery') || symptoms.includes('engine')) {
    return {
      possibleCauses: ['Dead battery', 'Starter motor issues', 'Fuel system problems'],
      urgencyLevel: 'high',
      recommendedActions: ['Check battery connections', 'Try jump starting', 'Check fuel level'],
      estimatedCost: '$50 - $600',
      shouldSeeMechanic: true
    };
  }

  return {
    possibleCauses: ['General maintenance needed', 'Wear and tear', 'Minor component issue'],
    urgencyLevel: 'low',
    recommendedActions: ['Schedule routine inspection', 'Monitor symptoms', 'Check owner manual'],
    estimatedCost: '$50 - $300',
    shouldSeeMechanic: false
  };
}

export async function analyzeAudioDescription(audioDescription: string, vehicle: string): Promise<DiagnosticResponse> {
  return getDiagnostics({
    symptoms: audioDescription,
    vehicle,
    context: 'Audio description provided by user'
  });
}