import { handleChatStream } from '@mastra/ai-sdk';
import { createUIMessageStreamResponse } from 'ai';
import { mastra } from '@/mastra';
import { traigeAgent } from '@/mastra/agents/triage-agent';

export async function POST(req: Request) {
  const params = await req.json();
  const stream = await handleChatStream({
    mastra,
    agentId: traigeAgent.id,
    params,
  });
  return createUIMessageStreamResponse({
    stream: stream as Parameters<
      typeof createUIMessageStreamResponse
    >[0]['stream'],
  });
}
