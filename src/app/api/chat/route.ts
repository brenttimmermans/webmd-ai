import type { ChatRequestBody } from '@/types';
import { handleChatPost } from './handler';

export async function POST(req: Request): Promise<Response> {
  const params = (await req.json()) as ChatRequestBody;
  return handleChatPost(params);
}
