import { handleChatPost } from './handler';
import type { ChatRequestBody } from './types';

export async function POST(req: Request): Promise<Response> {
  const params = (await req.json()) as ChatRequestBody;
  return handleChatPost(params);
}
