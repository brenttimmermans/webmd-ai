import { handleChatStream } from '@mastra/ai-sdk';
import { RequestContext } from '@mastra/core/request-context';
import { createUIMessageStreamResponse } from 'ai';
import { eq } from 'drizzle-orm';

import { messages, sessions } from '@/db/schema';
import { db } from '@/lib/db';
import { isValidUuid } from '@/lib/uuid';
import { mastra } from '@/mastra';
import { traigeAgent } from '@/mastra/agents/triage-agent';
import type { ChatRequestBody, TextDeltaPayload } from '@/types';
import { MessageRole } from '@/types';

export async function handleChatPost(
  params: ChatRequestBody,
): Promise<Response> {
  const sessionId =
    typeof params.sessionId === 'string' ? params.sessionId : null;

  const isValidSession = sessionId !== null && isValidUuid(sessionId);

  if (
    isValidSession &&
    Array.isArray(params.messages) &&
    params.messages.length > 0
  ) {
    const lastMessage = params.messages[params.messages.length - 1];

    const isUserMessage = lastMessage?.role === MessageRole.User;
    if (isUserMessage) {
      const message = lastMessage.parts?.[0].text?.trim();
      if (message) {
        await saveMessage(sessionId, MessageRole.User, message);
      }
    }
  }

  const requestContext = new RequestContext();
  if (isValidSession) {
    requestContext.set('sessionId', sessionId);
  }

  const stream = await handleChatStream({
    mastra,
    agentId: traigeAgent.id,
    // @ts-expect-error - TODO: fix this
    params: { ...params, requestContext },
  });

  const transformedStream = isValidSession
    ? stream.pipeThrough(createStreamCaptureTransform(sessionId))
    : stream;

  return createUIMessageStreamResponse({
    // @ts-expect-error - TODO: fix this
    stream: transformedStream,
  });
}

async function saveMessage(
  sessionId: string,
  role: MessageRole.User | MessageRole.Assistant,
  content: string,
): Promise<void> {
  try {
    await db.insert(messages).values({
      sessionId,
      role,
      content,
    });
    await db
      .update(sessions)
      .set({ updatedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  } catch {
    // Fire-and-forget; do not block response
  }
}

function createStreamCaptureTransform(
  sessionId: string,
): TransformStream<Uint8Array | unknown, Uint8Array | unknown> {
  let assistantText = '';
  let sseBuffer = '';

  return new TransformStream({
    transform(
      chunk: unknown,
      controller: TransformStreamDefaultController<Uint8Array | unknown>,
    ) {
      if (chunk instanceof Uint8Array) {
        sseBuffer += new TextDecoder().decode(chunk);
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload) as TextDeltaPayload;
              if (parsed.type === 'text-delta') {
                assistantText += parsed.delta ?? parsed.textDelta ?? '';
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } else if (chunk && typeof chunk === 'object') {
        const part = chunk as TextDeltaPayload;
        if (part.type === 'text-delta') {
          assistantText += part.delta ?? part.textDelta ?? '';
        }
      }
      controller.enqueue(chunk);
    },
    async flush() {
      if (assistantText.trim() && isValidUuid(sessionId)) {
        await saveMessage(
          sessionId,
          MessageRole.Assistant,
          assistantText.trim(),
        );
      }
    },
  });
}
