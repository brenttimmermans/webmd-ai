import { createTool } from '@mastra/core/tools';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { results, sessions } from '@/db/schema';
import { db } from '@/lib/db';
import { isValidUuid } from '@/lib/uuid';

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
    'REQUIRED: Call this tool when you have gathered enough symptom information. You MUST use this tool to complete the triage — never provide recommendations as text. Use after 3-5 follow-up exchanges.',
  inputSchema,
  outputSchema,
  requestContextSchema: z.object({
    sessionId: z.string().optional(),
  }),
  execute: async (
    inputData: z.infer<typeof inputSchema>,
    context?: {
      requestContext?: { get: (key: 'sessionId') => string | undefined };
    },
  ): Promise<z.infer<typeof outputSchema>> => {
    const result = {
      id: crypto.randomUUID(),
      urgency: inputData.urgency,
      pathway: inputData.pathway,
      consultationType: inputData.consultationType,
      next: inputData.next,
      reasoning: inputData.reasoning,
      symptoms: inputData.symptoms,
    };

    const sessionId = context?.requestContext?.get('sessionId') as
      | string
      | undefined;
    if (sessionId) {
      await saveTriageResult(sessionId, result);
    }

    return result;
  },
});

async function saveTriageResult(
  sessionId: string,
  result: z.infer<typeof outputSchema>,
): Promise<void> {
  if (!isValidUuid(sessionId)) return;

  try {
    await db
      .insert(results)
      .values({
        sessionId,
        urgency: result.urgency,
        pathway: result.pathway,
        consultationType: result.consultationType,
        nextSteps: result.next,
        rawOutput: result as unknown as Record<string, unknown>,
      })
      .onConflictDoNothing({ target: results.sessionId });
    await db
      .update(sessions)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  } catch {
    // Fire-and-forget; do not block response
  }
}
