'use client';

import '@/app/globals.css';
import { useChat } from '@ai-sdk/react';
import type { ToolUIPart } from 'ai';
import { DefaultChatTransport } from 'ai';
import { Plus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { createSession } from '@/lib/api-client';

function Chat(): React.ReactElement {
  const [input, setInput] = useState<string>('');
  const sessionIdRef = useRef<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () =>
          sessionIdRef.current ? { sessionId: sessionIdRef.current } : {},
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
  });

  const handleNewChat = (): void => {
    setMessages([]);
    sessionIdRef.current = null;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!input.trim()) return;

    if (!sessionIdRef.current) {
      const session = await createSession();
      if (!session) return;
      sessionIdRef.current = session.id;
    }

    sendMessage({ text: input });
    setInput('');
  };

  const isStreaming = status === 'streaming' || status === 'submitted';

  return (
    <div className="relative size-full h-screen w-full p-6">
      <header className="absolute right-6 top-6 flex items-center gap-2">
        <button
          type="button"
          onClick={handleNewChat}
          disabled={isStreaming}
          className="flex items-center gap-2 rounded-md border border-solid border-black/[0.08] px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[0.04] disabled:pointer-events-none disabled:opacity-50 dark:border-white/[0.145] dark:hover:bg-white/[0.08]"
          aria-label="Start new chat"
        >
          <Plus className="size-4" />
          New Chat
        </button>
      </header>
      <div className="flex h-full flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts?.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }

                  if (part.type?.startsWith('tool-')) {
                    return (
                      <Tool key={`${message.id}-${i}`}>
                        <ToolHeader
                          type={(part as ToolUIPart).type}
                          state={
                            (part as ToolUIPart).state || 'output-available'
                          }
                          className="cursor-pointer"
                        />
                        <ToolContent>
                          <ToolInput input={(part as ToolUIPart).input || {}} />
                          <ToolOutput
                            output={(part as ToolUIPart).output}
                            errorText={(part as ToolUIPart).errorText}
                          />
                        </ToolContent>
                      </Tool>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
            <ConversationScrollButton />
          </ConversationContent>
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-20">
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              className="md:leading-10"
              value={input}
              placeholder="Type your message..."
              disabled={status !== 'ready'}
            />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}

export default Chat;
