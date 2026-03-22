'use client';

import '@/app/globals.css';
import { useChat } from '@ai-sdk/react';
import type { ToolUIPart } from 'ai';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import Sidebar from '@/components/chat/Sidebar';
import { InputGroupAddon } from '@/components/ui/input-group';
import type { Session, SessionWithMessages } from '@/lib/api-client';
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
} from '@/lib/api-client';

function sessionMessagesToUiMessages(session: SessionWithMessages): Array<{
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{ type: 'text'; text: string }>;
}> {
  return session.messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: [{ type: 'text' as const, text: message.content }],
  }));
}

function Chat(): React.ReactElement {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [input, setInput] = useState<string>('');

  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadSessions(): Promise<void> {
      const list = await listSessions();
      setSessions(list);
    }
    void loadSessions();
  }, []);

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

  const handleLoadSession = async (id: string): Promise<void> => {
    const session = await getSession(id);
    if (!session) return;

    setMessages(sessionMessagesToUiMessages(session));
    sessionIdRef.current = id;
    setCurrentSessionId(id);
  };

  const handleNewChat = (): void => {
    setMessages([]);
    sessionIdRef.current = null;
    setCurrentSessionId(null);
  };

  const handleDeleteSession = async (id: string): Promise<void> => {
    if (!window.confirm('Delete this session?')) return;

    const ok = await deleteSession(id);
    if (!ok) return;

    setSessions((prev) => prev.filter((s) => s.id !== id));

    if (id === currentSessionId) {
      setMessages([]);
      sessionIdRef.current = null;
      setCurrentSessionId(null);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!input.trim()) return;

    if (!sessionIdRef.current) {
      const session = await createSession();
      if (!session) return;
      sessionIdRef.current = session.id;
      setCurrentSessionId(session.id);
      const list = await listSessions();
      setSessions(list);
    }

    sendMessage({ text: input });
    setInput('');
  };

  const isStreaming = status === 'streaming' || status === 'submitted';

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleLoadSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isNewChatDisabled={isStreaming}
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex h-full flex-col">
          <Conversation className="h-full">
            <ConversationContent>
              <header className="flex flex-col items-center gap-6 pb-8 pt-4">
                <Image
                  src="/images/otto-avatar.png"
                  alt="Otto, your friendly medical triage assistant"
                  width={280}
                  height={280}
                  className="h-auto w-48 shrink-0 object-contain md:w-64"
                  priority
                  unoptimized
                />
                <div className="flex max-w-lg flex-col gap-2 text-center">
                  <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Hi, I&apos;m Otto
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Whenever you&apos;re ready, share what&apos;s on your mind.
                    I&apos;ll ask a few questions about your symptoms and help
                    you figure out what to do next. I can&apos;t diagnose, but
                    I&apos;ll listen and point you in the right direction.
                  </p>
                </div>
              </header>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.parts?.map((part, i) => {
                    if (part.type === 'text') {
                      if (message.role === 'assistant') {
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="flex w-full max-w-[95%] flex-row items-start gap-2"
                          >
                            <Image
                              src="/images/otto-head.png"
                              alt="Otto"
                              width={48}
                              height={48}
                              className="h-12 w-12 shrink-0 rounded-full object-cover"
                            />
                            <Message from={message.role}>
                              <MessageContent>
                                <MessageResponse>{part.text}</MessageResponse>
                              </MessageContent>
                            </Message>
                          </div>
                        );
                      }
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
                            <ToolInput
                              input={(part as ToolUIPart).input || {}}
                            />
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
              <InputGroupAddon align="inline-end">
                <PromptInputSubmit status={status} />
              </InputGroupAddon>
            </PromptInputBody>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default Chat;
