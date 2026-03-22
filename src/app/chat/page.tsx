'use client';

import '@/app/globals.css';
import { useChat } from '@ai-sdk/react';
import type { ToolUIPart } from 'ai';
import { DefaultChatTransport } from 'ai';
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
            </PromptInputBody>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default Chat;
