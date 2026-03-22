import type {
  ConsultationType,
  MessageRole,
  NextSteps,
  SessionStatus,
  Urgency,
} from './enums';

export type TriageResult = {
  urgency: Urgency;
  pathway: string;
  consultationType: ConsultationType | string;
  nextSteps: NextSteps | string;
  reasoning?: string;
  symptoms?: string[];
};

export type MinimalSession = {
  id: string;
  status: SessionStatus | string;
  createdAt: string;
  updatedAt: string;
};

export type Session = MinimalSession & {
  messages: Message[];
  result?: SessionResult | null;
};

export type SessionResult = {
  id: string;
  urgency: Urgency | string;
  pathway: string;
  consultationType: ConsultationType | string;
  nextSteps: NextSteps | string;
  rawOutput: Record<string, unknown> | null;
  createdAt: string;
};

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type ListSessionsResponse = MinimalSession[];
export type GetSessionResponse = Session;
export type CreateSessionResponse = Session;
