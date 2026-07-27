# llm-gateway

An Express + TypeScript gateway that combines Markdown documents with prompts, sends them to a local LLM (Ollama / Gemma 4 12B), and returns answers.

It runs continuously on a home Mac mini (M4 / 16GB) and answers questions from authorized clients based on the documents you provide.

## Architecture

Development happens on a MacBook Air; production runs on a Mac mini. Deployment is automated through GitHub.

```
MacBook Air (development)
      │ git push (main)
      ▼
   GitHub
      │ GitHub Actions (CD)
      ▼
Mac mini (production, self-hosted runner)
   git pull → build → launchd restart
```

- Code is managed in Git (recoverable if lost).
- Documents, prompts, and .env live only under `~/server/data` on the Mac mini and are never committed to Git.

## Request flow

```
POST /api/chat
  → read docs/*.md
  → select prompts/*.txt
  → assemble prompt + documents + question
  → send to Ollama (OpenAI-compatible API)
  → return the answer
```

## Endpoints

| Method | Path           | Description                                                 |
| ------ | -------------- | ----------------------------------------------------------- |
| GET    | `/health`      | Health check                                                |
| GET    | `/api/prompts` | List selectable prompts                                     |
| POST   | `/api/chat`    | Ask a question: `{ "question": "...", "prompt": "qa.txt" }` |

## Development

See `docs/SETUP.md` for required tools and setup.

```bash
pnpm dev          # Start in dev mode (tsx watch)
pnpm build        # Build to dist/
pnpm start        # Run the built output
pnpm typecheck    # Type check
pnpm lint         # ESLint
pnpm format       # Prettier (check only)
pnpm format:write # Prettier (write changes)
```

## Tech stack

- Runtime: Node.js 24 (pinned via Volta)
- Package manager: pnpm (pinned via Corepack + the packageManager field)
- Language: TypeScript 6
- Framework: Express 5
- LLM runtime: Ollama (Gemma 4 12B)

## Documentation

- Setup guide: `docs/SETUP.md`
- Operations and troubleshooting: `docs/OPERATIONS.md`
