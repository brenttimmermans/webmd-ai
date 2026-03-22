export interface CreateSessionResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createSession(): Promise<CreateSessionResponse | null> {
  const res = await fetch('/api/sessions', { method: 'POST' });

  if (!res.ok) return null;

  return (await res.json()) as CreateSessionResponse;
}
