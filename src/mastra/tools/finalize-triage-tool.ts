import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const urgencyEnum = z.enum(['emergency', 'urgent', 'routine']);
const consultationTypeEnum = z.enum([
  'emergency-room',
  'first-appointment',
  'check-up',
  'cardiography',
  'stress-test',
  'imaging',
  'follow-up',
]);
const nextEnum = z.enum([
  'call-emergency',
  'schedule-urgent',
  'schedule',
  'self-care',
]);

const inputSchema = z.object({
  urgency: urgencyEnum.describe('Urgency level: emergency, urgent, or routine'),
  pathway: z
    .string()
    .describe('Suggested specialty (e.g. Cardiology, Pulmonology)'),
  consultationType: consultationTypeEnum.describe(
    'Type of consultation recommended',
  ),
  next: nextEnum.describe('Recommended next action for the patient'),
  reasoning: z.string().describe('Brief clinical reasoning for the care team'),
  symptoms: z
    .array(z.string())
    .describe('List of key symptoms identified during assessment'),
});

const outputSchema = z.object({
  id: z.string(),
  urgency: urgencyEnum,
  pathway: z.string(),
  consultationType: consultationTypeEnum,
  next: nextEnum,
  reasoning: z.string(),
  symptoms: z.array(z.string()),
});

export const finalizeTriage = createTool({
  id: 'finalize-triage',
  description:
    'Call this when you have gathered enough symptom information to produce a triage recommendation. Use after 3-5 follow-up exchanges.',
  inputSchema,
  outputSchema,
  execute: async (
    inputData: z.infer<typeof inputSchema>,
  ): Promise<z.infer<typeof outputSchema>> => {
    return {
      id: crypto.randomUUID(),
      urgency: inputData.urgency,
      pathway: inputData.pathway,
      consultationType: inputData.consultationType,
      next: inputData.next,
      reasoning: inputData.reasoning,
      symptoms: inputData.symptoms,
    };
  },
});
