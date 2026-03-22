'use client';

import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

import type { Session } from '@/lib/api-client';

export interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isNewChatDisabled?: boolean;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isNewChatDisabled = false,
}: SidebarProps): React.ReactElement {
  return (
    <aside
      className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
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
              <li key={session.id} className="group">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={`min-w-0 flex-1 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      currentSessionId === session.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : ''
                    }`}
                  >
                    {format(new Date(session.createdAt), 'dd/MM HH:mm')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-sidebar-accent group-hover:opacity-100"
                    aria-label="Delete session"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
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
          className="flex w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Start new chat"
        >
          <Plus className="size-4" />
          New Chat
        </button>
      </div>
    </aside>
  );
}
