# WebMD AI — Otto

> The [`docs`](docs) folder includes some additional notes and a time sheet for this case.

<p align="center">
  <img src="public/images/otto-full.png" alt="Otto" width="120" />
</p>

**Otto** is a friendly medical triage assistant. Share what's on your mind and Otto will ask clarifying questions about your symptoms, then suggest a recommended pathway (emergency, urgent, or routine care). Otto doesn’t diagnose; it listens and directs you to the right next steps.

---

## Run the project

### Prerequisites

- Node.js 22+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and set:
#   - DATABASE_URL      (PostgreSQL connection string)
#   - OPENAI_API_KEY    (OpenAI API key)
#   - APP_USERNAME / APP_PASSWORD (optional, for basic auth)
```

### Database

```bash
# Generate migrations (if needed)
npm run db:generate

# Run migrations
npm run db:migrate
```

### Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go to the chat.

---

## Tech stack

| Layer          | Tech                                    |
| -------------- | --------------------------------------- |
| **Framework**  | Next.js 16, React 19                    |
| **AI**         | Mastra, OpenAI GPT-4o-mini              |
| **Database**   | Drizzle ORM, Neon (serverless Postgres) |
| **UI**         | shadcn/ui, Radix UI, Tailwind CSS       |
| **Chat**       | Vercel AI SDK                           |
| **Validation** | Zod                                     |

---

## Architecture

```
  Chat UI         API (/chat, /sessions)        Mastra Agent
  (Next.js)  →    (Next.js routes)         →    (GPT-4o-mini)
                        │                             │
                        ├─────────────────────────────┼── OpenAI
                        │                             │
                        └─────────────────────────────┴── Postgres (Neon)
```

- **API** — Stores sessions and messages in Postgres.
- **Mastra agent** — Calls OpenAI for chat; `finalizeTriage` tool writes triage results to Postgres.
