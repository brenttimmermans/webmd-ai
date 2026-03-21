# API routes plan — Session CRUD

## Overview

Four routes covering session management for the triage app sidebar. All routes live under `app/api/sessions/` using Next.js App Router conventions. No auth — all sessions belong to a single implicit user.

The chat/streaming endpoint is handled separately and is not covered here.

## Route map

| Method   | Path                 | Purpose                        |
| -------- | -------------------- | ------------------------------ |
| `GET`    | `/api/sessions`      | List all sessions for sidebar  |
| `POST`   | `/api/sessions`      | Create a new session           |
| `GET`    | `/api/sessions/[id]` | Fetch one session with history |
| `DELETE` | `/api/sessions/[id]` | Soft-delete a session          |

## File structure

```
app/
└── api/
    └── sessions/
        ├── route.ts              ← GET (list) + POST (create)
        └── [id]/
            └── route.ts          ← GET (single) + DELETE
```

---

## Route details

### `GET /api/sessions`

Populates the sidebar session list.

**Query**: Select from `sessions` where `status != 'abandoned'`, ordered by `updated_at DESC`.

**Response** `200`:

```json
[
  {
    "id": "uuid",
    "status": "active",
    "createdAt": "2025-03-21T10:00:00Z",
    "updatedAt": "2025-03-21T10:05:00Z"
  }
]
```

**Notes**:

- Only return `id`, `status`, `createdAt`, `updatedAt` — the sidebar doesn't need messages or results. Use timestamps to reference sessions in the list.

---

### `POST /api/sessions`

Creates a new triage session and redirects the user into it.

**Request body**: None required. The session starts empty with `status = active`.

**Response** `201`:

```json
{
  "id": "uuid",
  "status": "active",
  "createdAt": "2025-03-21T10:00:00Z",
  "updatedAt": "2025-03-21T10:00:00Z"
}
```

**Notes**:

- The frontend should redirect to `/session/[id]` (or however the chat view is routed) after receiving the response.

---

### `GET /api/sessions/[id]`

Fetches a single session with its full message history and result (if completed). Used when reopening a session from the sidebar.

**Response** `200`:

```json
{
  "id": "uuid",
  "status": "completed",
  "createdAt": "2025-03-21T10:00:00Z",
  "updatedAt": "2025-03-21T10:12:00Z",
  "messages": [
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Hello, I'm here to help assess your symptoms...",
      "createdAt": "2025-03-21T10:00:01Z"
    },
    {
      "id": "uuid",
      "role": "user",
      "content": "I have a sharp pain in my chest on the left side",
      "createdAt": "2025-03-21T10:01:00Z"
    }
  ],
  "result": {
    "id": "uuid",
    "urgency": "urgent",
    "pathway": "Cardiology",
    "consultationType": "check-up",
    "nextSteps": "schedule",
    "rawOutput": { ... },
    "createdAt": "2025-03-21T10:12:00Z"
  }
}
```

**Error** `404`:

```json
{ "error": "Session not found", "code": "SESSION_NOT_FOUND" }
```

**Notes**:

- Messages are ordered by `created_at ASC` to reconstruct the conversation chronologically.
- `result` is `null` if the session is still `active` (no triage finalized yet).
- Also return `404` if the session exists but has `status = abandoned` — treat soft-deleted sessions as gone from the user's perspective.

---

### `DELETE /api/sessions/[id]`

Soft-deletes a session by setting `status = abandoned`.

**Response** `200`:

```json
{ "success": true }
```

**Error** `404`:

```json
{ "error": "Session not found", "code": "SESSION_NOT_FOUND" }
```

**Notes**:

- This is a soft delete: update `status = 'abandoned'` and `updated_at = now()`. The data stays in the database for debugging.
- The `GET /api/sessions` list query already filters out abandoned sessions, so the sidebar updates automatically on refetch.
- If you later need a hard delete (e.g. for GDPR compliance), you can add a `?hard=true` query param or a separate admin route that does `DELETE CASCADE`.

---

## Error handling

All routes should return consistent error shapes:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```

| Status | Code                   | When                                   |
| ------ | ---------------------- | -------------------------------------- |
| `400`  | `INVALID_REQUEST`      | Invalid request body or malformed UUID |
| `404`  | `SESSION_NOT_FOUND`    | Session not found or is abandoned      |
| `500`  | `INTERNAL_SERVER_ERROR`| Database or unexpected server error    |

Use `code` consistently: reuse the same code wherever the same condition applies (e.g. `SESSION_NOT_FOUND` for both GET and DELETE when the session doesn't exist or is abandoned).

Validate the `[id]` param as a valid UUID before querying — Drizzle will throw on malformed UUIDs otherwise. A simple regex check (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) in a shared utility keeps this DRY.

## Implementation notes

- **Response casing**: The database uses `snake_case` (`created_at`, `next_steps`). Transform to `camelCase` in the API response (`createdAt`, `nextSteps`) so the frontend stays idiomatic TypeScript. A small `toCamel` utility or Drizzle's `.select()` aliasing handles this.
- **Drizzle queries**: Use `db.select()` for reads and `db.insert()` / `db.update()` for writes. The `returning()` method on insert/update gives you the created/updated row without a second query.
- **NextResponse**: Use `NextResponse.json(data, { status })` for all responses.
