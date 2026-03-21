import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const triageSchema = z.object({
  id: z.string(),
  urgency: z.enum(['emergency', 'urgent', 'routine']),
  pathway: z.string(),
  consultationType: z.string(),
  next: z.string(),
  reasoning: z.string(),
  symptoms: z.array(z.string()),
});

const agentResponseSchema = z.object({
  response: z.string(),
});

function extractJsonFromResponse(text: string): unknown | null {
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (!jsonBlockMatch) return null;

  try {
    return JSON.parse(jsonBlockMatch[1].trim()) as unknown;
  } catch {
    return null;
  }
}

const assessSymptoms = createStep({
  id: 'assess-symptoms',
  description: 'Invokes the triage agent with the patient\'s initial symptom description',
  inputSchema: z.object({
    initialSymptoms: z.string().describe('The patient\'s initial symptom description'),
  }),
  outputSchema: agentResponseSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('traigeAgent');
    if (!agent) {
      throw new Error('Triage agent not found');
    }

    const prompt = `I'm experiencing the following symptoms. Please help me understand what I should do next:\n\n${inputData.initialSymptoms}`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let responseText = '';

    for await (const chunk of response.textStream) {
      responseText += chunk;
    }

    return {
      response: responseText,
    };
  },
});

const parseRecommendation = createStep({
  id: 'parse-recommendation',
  description: 'Extracts and parses the structured triage recommendation from the agent response',
  inputSchema: agentResponseSchema,
  outputSchema: z.object({
    response: z.string(),
    recommendation: triageSchema.optional().nullable(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const response = inputData.response;
    const parsed = extractJsonFromResponse(response);

    if (!parsed || typeof parsed !== 'object') {
      return {
        response,
        recommendation: null,
      };
    }

    const result = triageSchema.safeParse(parsed);

    return {
      response,
      recommendation: result.success ? result.data : null,
    };
  },
});

const triageWorkflow = createWorkflow({
  id: 'triage-workflow',
  inputSchema: z.object({
    initialSymptoms: z.string().describe('The patient\'s initial symptom description'),
  }),
  outputSchema: z.object({
    response: z.string(),
    recommendation: triageSchema.optional().nullable(),
  }),
})
  .then(assessSymptoms)
  .then(parseRecommendation);

triageWorkflow.commit();

export { triageWorkflow };
