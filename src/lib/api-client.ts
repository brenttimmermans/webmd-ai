import {
  type CreateSessionResponse,
  type GetSessionResponse,
  type ListSessionsResponse,
  type SessionResult,
  type TriageResult,
  Urgency,
} from '@/types';

export async function listSessions(): Promise<ListSessionsResponse> {
  const res = await fetch('/api/sessions');
  if (!res.ok) return [];
  return (await res.json()) as ListSessionsResponse;
}

export async function getSession(
  id: string,
): Promise<GetSessionResponse | null> {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as GetSessionResponse;
}

export async function createSession(): Promise<CreateSessionResponse | null> {
  const res = await fetch('/api/sessions', { method: 'POST' });

  if (!res.ok) return null;

  return (await res.json()) as CreateSessionResponse;
}

export async function deleteSession(id: string): Promise<boolean> {
  const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  return res.ok;
}

export function sessionResultToTriageResult(
  result: SessionResult,
): TriageResult {
  const raw = result.rawOutput ?? {};
  return {
    urgency: result.urgency as Urgency,
    pathway: result.pathway,
    consultationType: result.consultationType,
    nextSteps: result.nextSteps,
    reasoning: typeof raw.reasoning === 'string' ? raw.reasoning : undefined,
    symptoms: Array.isArray(raw.symptoms)
      ? (raw.symptoms as string[])
      : undefined,
  };
}

export function toolOutputToTriageResult(output: unknown): TriageResult | null {
  if (!output || typeof output !== 'object') return null;
  const o = output as Record<string, unknown>;
  const urgency = o.urgency;
  const pathway = o.pathway;
  const consultationType = o.consultationType;
  const nextSteps = (o.nextSteps as string) ?? (o.next as string);
  if (
    typeof urgency !== 'string' ||
    typeof pathway !== 'string' ||
    typeof consultationType !== 'string' ||
    typeof nextSteps !== 'string'
  ) {
    return null;
  }
  if (
    urgency !== Urgency.Emergency &&
    urgency !== Urgency.Urgent &&
    urgency !== Urgency.Routine
  ) {
    return null;
  }
  return {
    urgency: urgency as Urgency,
    pathway,
    consultationType,
    nextSteps,
    reasoning: typeof o.reasoning === 'string' ? o.reasoning : undefined,
    symptoms: Array.isArray(o.symptoms) ? (o.symptoms as string[]) : undefined,
  };
}
