/**
 * Drizzle schema. Add tables here, then run:
 *   npx drizzle-kit generate
 *   npx drizzle-kit migrate
 */

import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { MessageRole, SessionStatus, Urgency } from '@/types/enums';

const sessionStatusEnum = pgEnum(
  'session_status',
  Object.values(SessionStatus) as [string, ...string[]],
);

const messageRoleEnum = pgEnum(
  'message_role',
  Object.values(MessageRole) as [string, ...string[]],
);

const urgencyEnum = pgEnum(
  'urgency',
  Object.values(Urgency) as [string, ...string[]],
);

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: sessionStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const results = pgTable('results', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' })
    .unique(),
  urgency: urgencyEnum('urgency').notNull(),
  pathway: text('pathway').notNull(),
  consultationType: text('consultation_type').notNull(),
  nextSteps: text('next_steps').notNull(),
  rawOutput: jsonb('raw_output').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
