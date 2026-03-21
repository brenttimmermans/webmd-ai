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

const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'completed',
  'abandoned',
]);

const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

const urgencyEnum = pgEnum('urgency', ['emergency', 'urgent', 'routine']);

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
