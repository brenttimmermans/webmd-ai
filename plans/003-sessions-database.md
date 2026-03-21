# Database plan — Triage app

## Overview

Three tables: sessions hold the conversation container, messages store the chat history with a foreign key back to sessions, and triage results capture the structured output once the AI agent finalizes a triage. No auth layer — all sessions belong to a single implicit user.

## Schema

### `sessions`

| Column       | Type        | Notes                                |
| ------------ | ----------- | ------------------------------------ |
| `id`         | `uuid` (PK) | Generated via `gen_random_uuid()`    |
| `status`     | `enum`      | `active` · `completed` · `abandoned` |
| `created_at` | `timestamp` | Default `now()`                      |
| `updated_at` | `timestamp` | Updated on every status change             |

### `messages`

| Column       | Type        | Notes                                            |
| ------------ | ----------- | ------------------------------------------------ |
| `id`         | `uuid` (PK) | Generated via `gen_random_uuid()`                |
| `session_id` | `uuid` (FK) | References `sessions.id` (cascade delete) |
| `role`       | `enum`      | `user` · `assistant` · `system`                  |
| `content`    | `text`      | Message body                                     |
| `created_at` | `timestamp` | Default `now()`                                  |

### `results`

| Column              | Type        | Notes                                                    |
| ------------------- | ----------- | -------------------------------------------------------- |
| `id`                | `uuid` (PK) | Generated via `gen_random_uuid()`                        |
| `session_id`        | `uuid` (FK) | References `sessions.id` (cascade delete, unique) |
| `urgency`           | `enum`      | `emergency` · `urgent` · `routine`                       |
| `pathway`           | `text`      | e.g. `Cardiology`, `Pulmonology`                         |
| `consultation_type` | `text`      | e.g. `check-up`, `cardiography`, `first-appointment`     |
| `next_steps`        | `text`      | e.g. `schedule`, `emergency_instructions`                |
| `raw_output`        | `jsonb`     | Full structured JSON for hospital integration            |
| `created_at`        | `timestamp` | Default `now()`                                          |

## Relationships

- **sessions → messages**: One-to-many. Each session has many messages. Messages are ordered by `created_at` to reconstruct the conversation.
- **sessions → results**: One-to-one (optional). A result only exists once the Mastra agent calls the `finalizeTriage` tool, at which point the session status flips to `completed`. The `unique` constraint on `session_id` enforces the 1:1 relationship.

## Session lifecycle

1. **Create**: User starts a new triage → insert a row into `sessions` with `status = active`.
2. **Conversation**: Messages accumulate in the `messages` table linked by `session_id`.
3. **Triage complete**: The Mastra agent calls `finalizeTriage` → insert into `results`, update session `status = completed`.
4. **Revisit**: User can reopen any session and see the full message history and triage result.
5. **Delete**: Soft-delete by setting `status = abandoned` (keeps data for debugging), or hard-delete with cascade removing messages and result.

## Session management (single user, no auth)

The app supports multiple sessions for one implicit user:

- **Sidebar / session list**: Query `sessions` ordered by `updated_at DESC`, filtered to exclude `abandoned`. Display timestamp (e.g. `created_at` or `updated_at`) and `status` badge.
- **New session**: Insert new row, redirect to chat view.
- **Delete session**: Set `status = abandoned` (soft delete). UI filters these out.
- **Reopen session**: Load session by `id`, fetch messages ordered by `created_at`, render chat history. If `status = completed`, also fetch and display the triage result card.

## Hospital integration output

When a triage completes, the `raw_output` JSONB column stores the full structured object a hospital system would consume:

```json
{
  "id": "uuid",
  "urgency": "urgent",
  "pathway": "Cardiology",
  "consultationType": "check-up",
  "next": "schedule"
}
```

This is stored both as structured columns (for querying and filtering) and as raw JSON (for forwarding to external systems without transformation).

## Tech notes

- **ORM**: Drizzle with `drizzle-orm/neon-http` adapter.
- **Migrations**: Drizzle Kit (`drizzle-kit generate` + `drizzle-kit migrate`).
- **Database**: Neon Postgres (serverless, works well with Vercel's edge runtime).
- **Enums**: Defined as Postgres enums via Drizzle's `pgEnum`.
