Perfect — I have everything I need. Let me put together a comprehensive plan.Here's your high-level plan, starting with an architecture overview:Now here's the plan, broken into time blocks with clear cut lines.

## The plan: 8 hours, 5 phases

**Phase 1 — Scaffold & infrastructure (1.5h)**

Set up the Next.js project with TypeScript and Tailwind. Spin up a Neon Postgres database, wire up Drizzle ORM, and define your schema: a `triage_sessions` table (id, status, urgency, pathway, consultationType, next steps, timestamps) and a `messages` table (id, sessionId, role, content, timestamp). Get a basic migration running so the DB is ready. Deploy a "hello world" to Vercel early — you want deploy working before you build features.

**Phase 2 — Mastra agent + triage logic (2h)**

This is the core brain. Set up Mastra with a triage agent that has a carefully crafted system prompt defining its role: empathetic medical intake, asking follow-up questions about symptoms (location, severity, duration, triggers), and making a structured triage decision. Define a `finalizeTriage` tool the agent calls when it has enough info — this tool outputs the structured JSON (urgency, pathway, consultationType, next). The agent should guide the conversation through roughly 3–5 exchanges before concluding. Test it with the chest pain scenario end-to-end via API before touching the frontend.

**Phase 3 — Chat UI + streaming (2h)**

Build the conversational interface using Vercel AI SDK's `useChat` hook to stream responses from the Mastra agent. Key screens: a welcome/landing state, the active chat with typing indicators and message bubbles, and a triage result card that renders when the agent finalizes. Focus on making the chat feel trustworthy — clear attribution of who's speaking, a calm medical-grade visual tone, and smooth streaming text.

**Phase 4 — Polish & states (1.5h)**

This is where you earn UX points. Handle empty states (fresh session), loading/streaming states, error states (API failure, timeout), and the "triage complete" state with a clear result summary card showing urgency (color-coded badge), recommended pathway, consultation type, and next steps. Add subtle animations for message entry. Make sure the urgency badge is visually unmistakable — red for emergency, amber for urgent, green for routine.

**Phase 5 — Narrative, deploy & cleanup (1h)**

Write the narrative doc (approach, tradeoffs, what you'd do with more time). Do a final Vercel deploy. Smoke-test the full flow end-to-end. Clean up the repo: add a solid README with setup instructions, the architecture diagram, and screenshots. Push to GitHub.

## Cut lines (if running behind)

If you're at hour 6 and behind, here's what to drop in priority order: skip animations and micro-interactions (Phase 4), simplify error handling to a generic fallback, reduce the Mastra prompt complexity (fewer follow-up questions, faster triage). The non-negotiable core is: patient types symptoms → AI responds conversationally → structured triage JSON is produced and displayed.

## Key tech decisions baked in

The stack is Next.js App Router, Drizzle + Neon Postgres, Mastra for agent orchestration, Vercel AI SDK for streaming the chat, and Vercel for hosting. The structured triage output uses Mastra's tool-calling pattern so the LLM returns typed JSON, not free text you'd need to parse. This gives you a clean contract between the AI layer and any downstream hospital system.

Want me to dive deeper into any phase, or should I start generating scaffold code?
