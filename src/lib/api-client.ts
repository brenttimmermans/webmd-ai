export type Session = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionWithMessages = Session & {
  messages: Message[];
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
