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
  const symptoms = request.symptoms.toLowerCase();
  const vehicle = request.vehicle.toLowerCase();
  
  // Emergency situations - highest priority
  if (symptoms.includes('smoke') || symptoms.includes('fire') || symptoms.includes('burning') || 
      symptoms.includes('overheating') || symptoms.includes('steam')) {
    return {
      possibleCauses: ['Engine overheating', 'Electrical fire hazard', 'Coolant leak', 'Oil leak on hot components'],
      urgencyLevel: 'emergency',
      recommendedActions: ['Stop driving immediately', 'Turn off engine', 'Pull over safely', 'Call for emergency assistance'],
      estimatedCost: '$300 - $2500',
      shouldSeeMechanic: true
    };
  }

  // Starting issues
  if (symptoms.includes('won\'t start') || symptoms.includes('wont start') || symptoms.includes('no start') ||
      symptoms.includes('dead battery') || symptoms.includes('clicking') && symptoms.includes('start')) {
    return {
      possibleCauses: ['Dead battery', 'Faulty starter motor', 'Ignition system failure', 'Fuel pump issues'],
      urgencyLevel: 'high',
      recommendedActions: ['Check battery connections', 'Try jump starting', 'Test starter motor', 'Check fuel level'],
      estimatedCost: '$80 - $800',
      shouldSeeMechanic: true
    };
  }

  // Brake-related issues
  if (symptoms.includes('brake') || (symptoms.includes('squealing') && symptoms.includes('stop')) || 
      (symptoms.includes('grinding') && symptoms.includes('stop'))) {
    return {
      possibleCauses: ['Worn brake pads', 'Warped brake rotors', 'Low brake fluid', 'Brake caliper issues'],
      urgencyLevel: 'high',
      recommendedActions: ['Avoid hard braking', 'Check brake fluid level', 'Schedule immediate inspection', 'Drive carefully to mechanic'],
      estimatedCost: '$150 - $600',
      shouldSeeMechanic: true
    };
  }

  // Engine performance issues
  if (symptoms.includes('rough idle') || symptoms.includes('stalling') || symptoms.includes('misfir') ||
      symptoms.includes('hesitat') || symptoms.includes('power loss')) {
    return {
      possibleCauses: ['Spark plug issues', 'Fuel injector problems', 'Air filter clogged', 'Engine sensor malfunction'],
      urgencyLevel: 'medium',
      recommendedActions: ['Check air filter', 'Use fuel system cleaner', 'Schedule tune-up', 'Monitor engine performance'],
      estimatedCost: '$100 - $500',
      shouldSeeMechanic: true
    };
  }

  // Transmission issues
  if (symptoms.includes('transmission') || symptoms.includes('shifting') || symptoms.includes('gear') ||
      symptoms.includes('slipping') || symptoms.includes('jerking')) {
    return {
      possibleCauses: ['Low transmission fluid', 'Worn transmission components', 'Faulty solenoids', 'Clutch issues'],
      urgencyLevel: 'medium',
      recommendedActions: ['Check transmission fluid', 'Avoid aggressive driving', 'Schedule transmission service', 'Monitor shifting patterns'],
      estimatedCost: '$200 - $1500',
      shouldSeeMechanic: true
    };
  }

  // Steering and suspension
  if (symptoms.includes('steering') || symptoms.includes('vibrat') || symptoms.includes('pulling') ||
      symptoms.includes('suspension') || symptoms.includes('bouncing')) {
    return {
      possibleCauses: ['Wheel alignment issues', 'Worn suspension components', 'Tire problems', 'Power steering fluid low'],
      urgencyLevel: 'medium',
      recommendedActions: ['Check tire pressure', 'Inspect tires for wear', 'Check power steering fluid', 'Schedule alignment check'],
      estimatedCost: '$80 - $400',
      shouldSeeMechanic: true
    };
  }

  // Air conditioning/heating
  if (symptoms.includes('air condition') || symptoms.includes('heating') || symptoms.includes('ac') ||
      symptoms.includes('hot air') || symptoms.includes('cold air')) {
    return {
      possibleCauses: ['Refrigerant leak', 'Compressor failure', 'Blower motor issues', 'Thermostat problems'],
      urgencyLevel: 'low',
      recommendedActions: ['Check air filter', 'Inspect for visible leaks', 'Schedule AC service', 'Monitor system performance'],
      estimatedCost: '$100 - $800',
      shouldSeeMechanic: false
    };
  }

  // Electrical issues
  if (symptoms.includes('electrical') || symptoms.includes('lights') || symptoms.includes('battery') ||
      symptoms.includes('charging') || symptoms.includes('alternator')) {
    return {
      possibleCauses: ['Alternator failure', 'Battery issues', 'Faulty wiring', 'Fuse problems'],
      urgencyLevel: 'medium',
      recommendedActions: ['Check battery terminals', 'Test charging system', 'Inspect fuses', 'Monitor electrical components'],
      estimatedCost: '$80 - $600',
      shouldSeeMechanic: true
    };
  }

  // Strange noises - be more specific
  if (symptoms.includes('grinding')) {
    return {
      possibleCauses: ['Worn brake pads', 'Transmission issues', 'Wheel bearing problems', 'CV joint wear'],
      urgencyLevel: 'high',
      recommendedActions: ['Identify noise location', 'Avoid hard braking', 'Schedule immediate inspection', 'Drive carefully'],
      estimatedCost: '$150 - $800',
      shouldSeeMechanic: true
    };
  }

  if (symptoms.includes('squealing') || symptoms.includes('screeching')) {
    return {
      possibleCauses: ['Worn belts', 'Brake pad wear indicators', 'Pulley issues', 'Low power steering fluid'],
      urgencyLevel: 'medium',
      recommendedActions: ['Check belts for wear', 'Inspect brake pads', 'Check fluid levels', 'Schedule inspection'],
      estimatedCost: '$80 - $400',
      shouldSeeMechanic: true
    };
  }

  if (symptoms.includes('rattling') || symptoms.includes('knocking')) {
    return {
      possibleCauses: ['Loose heat shields', 'Engine knock', 'Exhaust system issues', 'Suspension components'],
      urgencyLevel: 'medium',
      recommendedActions: ['Use higher octane fuel', 'Check for loose components', 'Schedule inspection', 'Monitor noise patterns'],
      estimatedCost: '$100 - $600',
      shouldSeeMechanic: true
    };
  }

  // Oil and fluid issues
  if (symptoms.includes('oil') || symptoms.includes('fluid') || symptoms.includes('leak')) {
    return {
      possibleCauses: ['Oil leak', 'Seal failure', 'Gasket problems', 'Fluid level low'],
      urgencyLevel: 'medium',
      recommendedActions: ['Check fluid levels', 'Monitor leak location', 'Top off fluids as needed', 'Schedule repair'],
      estimatedCost: '$50 - $400',
      shouldSeeMechanic: true
    };
  }

  // Warning lights
  if (symptoms.includes('warning light') || symptoms.includes('check engine') || symptoms.includes('dashboard')) {
    return {
      possibleCauses: ['Sensor malfunction', 'Emissions system issues', 'Engine problems', 'Electrical faults'],
      urgencyLevel: 'medium',
      recommendedActions: ['Get diagnostic scan', 'Check gas cap', 'Monitor vehicle performance', 'Schedule diagnosis'],
      estimatedCost: '$80 - $500',
      shouldSeeMechanic: true
    };
  }

  // General maintenance or unclear symptoms
  return {
    possibleCauses: ['Normal wear and tear', 'Routine maintenance needed', 'Minor component issues', 'Scheduled service due'],
    urgencyLevel: 'low',
    recommendedActions: ['Follow maintenance schedule', 'Monitor symptoms', 'Check owner manual', 'Schedule routine inspection'],
    estimatedCost: '$50 - $200',
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