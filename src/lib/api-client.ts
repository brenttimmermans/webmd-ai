export type TriageResult = {
  urgency: 'emergency' | 'urgent' | 'routine';
  pathway: string;
  consultationType: string;
  nextSteps: string;
  reasoning?: string;
  symptoms?: string[];
};

export type Session = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionWithMessages = Session & {
  messages: Message[];
  result?: SessionResult | null;
};

export type SessionResult = {
  id: string;
  urgency: string;
  pathway: string;
  consultationType: string;
  nextSteps: string;
  rawOutput: Record<string, unknown> | null;
  createdAt: string;
};

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type MessageRole = 'user' | 'assistant' | 'system';

export type ListSessionsResponse = Session[];

export async function listSessions(): Promise<ListSessionsResponse> {
  const res = await fetch('/api/sessions');
  if (!res.ok) return [];
  return (await res.json()) as ListSessionsResponse;
}

export type GetSessionResponse = SessionWithMessages;

export async function getSession(
  id: string,
): Promise<GetSessionResponse | null> {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as GetSessionResponse;
}

export type CreateSessionResponse = SessionWithMessages;

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
    urgency: result.urgency as TriageResult['urgency'],
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
    urgency !== 'emergency' &&
    urgency !== 'urgent' &&
    urgency !== 'routine'
  ) {
    return null;
  }
  return {
    urgency,
    pathway,
    consultationType,
    nextSteps,
    reasoning: typeof o.reasoning === 'string' ? o.reasoning : undefined,
    symptoms: Array.isArray(o.symptoms) ? (o.symptoms as string[]) : undefined,
  };
}
