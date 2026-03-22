export interface UIMessagePart {
  type?: string;
  text?: string;
}

export interface UIMessage {
  role?: string;
  parts?: UIMessagePart[];
  content?: string;
}

export interface ChatRequestBody {
  messages?: UIMessage[];
  sessionId?: string;
}

export interface TextDeltaPayload {
  type?: string;
  delta?: string;
  textDelta?: string;
}
