'use client';

import { format } from 'date-fns';
import { Plus } from 'lucide-react';

import type { Session } from '@/lib/api-client';

export interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isNewChatDisabled?: boolean;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  isNewChatDisabled = false,
}: SidebarProps): React.ReactElement {
  return (
    <aside
      className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      aria-label="Chat sessions"
    >
      <nav className="flex flex-1 flex-col overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No sessions yet
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sessions.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    currentSessionId === session.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : ''
                  }`}
                >
                  {format(new Date(session.createdAt), 'dd/MM HH:mm')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={onNewChat}
          disabled={isNewChatDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-solid border-black/[0.08] px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[0.04] disabled:pointer-events-none disabled:opacity-50 dark:border-white/[0.145] dark:hover:bg-white/[0.08]"
          aria-label="Start new chat"
        >
          <Plus className="size-4" />
          New Chat
        </button>
      </div>
    </aside>
  );
}
