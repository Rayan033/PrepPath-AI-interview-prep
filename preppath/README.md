# PrepPath — Voice-Enabled Adaptive Interview Coach

PrepPath is an AI-powered mock interview platform that conducts voice-based interviews and **remembers your performance across sessions**. Built on [Backboard.io](https://backboard.io)'s persistent memory and RAG APIs, it adapts to your skill level over time — drilling weak areas harder and skipping topics you've already mastered.

## Features

- **Voice interviews** — speak naturally using your browser's mic; the AI interviewer asks questions aloud via text-to-speech
- **Persistent memory** — Backboard's memory layer tracks your strengths, weaknesses, and preferences across sessions
- **Resume + JD context** — upload your resume and paste a job description; the AI tailors questions to the specific role
- **Structured scoring** — every answer is scored 1–10 with specific feedback on strengths and improvements
- **Memory inspector** — view, edit, and delete what the AI remembers about you
- **Multiple interview types** — behavioral, technical, system design, or mixed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Voice I/O | Browser Web Speech API (SpeechRecognition + SpeechSynthesis) |
| AI Backend | [Backboard API](https://docs.backboard.io/) |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Backboard](https://app.backboard.io/signup) account (free $10 credits, no card required)
- A modern browser with Web Speech API support (Chrome or Edge recommended)

### Setup

```bash
# Clone and install
cd preppath
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set a COOKIE_SECRET (any 32+ character string)

# Start dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and:

1. Go to **Settings** and enter your Backboard API key
2. Click **Test Connection** to verify
3. Go to **New Interview**, upload your resume, paste a job description, and start

### Environment Variables

| Variable | Description |
|----------|-------------|
| `COOKIE_SECRET` | 32+ character secret for encrypting the API key cookie |

Your Backboard API key is entered at runtime through the Settings page and stored in an encrypted HTTP-only cookie — it never appears in environment files or client code.

## Architecture

```
Browser (React + Voice APIs)
    ↕ fetch()
Next.js API Routes (server-side, API key encrypted in cookie)
    ↕ Backboard SDK
Backboard Platform (LLM + Memory + RAG)
```

All Backboard API calls are proxied through server-side API routes. The Backboard API key is encrypted with AES-256-GCM and stored in an HTTP-only, Secure, SameSite=Strict cookie.

## Project Structure

```
src/
├── app/                    Pages and API routes
│   ├── page.tsx            Dashboard
│   ├── settings/           API key + voice config
│   ├── interview/
│   │   ├── setup/          Upload resume, configure interview
│   │   └── session/        Live voice interview room
│   ├── memory/             Memory inspector (view/edit/delete)
│   └── api/                Server-side API routes
├── components/             React components
│   ├── ui/                 shadcn/ui primitives
│   ├── interview/          Voice orb, transcript, controls, scores
│   ├── memory/             Memory cards and list
│   └── layout/             Navbar
├── hooks/                  useSpeechRecognition, useSpeechSynthesis, useBackboard
├── stores/                 Zustand interview state
└── lib/                    Server utilities, prompts, schemas, types
```

## Security

- API key encrypted (AES-256-GCM) in HTTP-only cookie
- All Backboard calls server-side only
- Zod validation on every API route
- In-memory rate limiting (30 req/min)
- CSP, X-Frame-Options, X-Content-Type-Options headers
- File upload validation (type + size)

## License

MIT
