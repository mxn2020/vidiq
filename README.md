# 🎬 VidIQ — Timestamped Video Intelligence Engine

> **"See what your video really shows."**

VidIQ is a consumer-accessible video analysis tool powered by NVIDIA AI models. Upload a video or paste a YouTube URL — get a structured, timestamped narrative with scene-level descriptions, object/brand/person identification, action recognition, and physics-aware contextual understanding.

Upload a video → Get a detailed, timestamped breakdown of everything happening.

---

## 🎯 What It Does

1. **Upload a video** — local file or YouTube URL
2. **AI analyzes every scene** — sampling at 4 FPS, processing every frame
3. **Get your analysis** — timestamped narrative, scene cards, object detection, and more

### Example Output

```
┌──────────────────────────────────────────┐
│  🎬 Video Analysis Complete              │
│                                          │
│  Duration: 00:44                         │
│  Scenes Detected: 14                     │
│  Objects Identified: 23                  │
│  Brands Detected: 3                      │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  00:00-00:02  Opening — Outdoor racing   │
│               event on a sunny day       │
│                                          │
│  00:02-00:06  Cockpit view — driver and  │
│               co-pilot in full gear      │
│                                          │
│  00:06-00:08  Dashboard POV — ENEOS      │
│               branding visible           │
│                                          │
│  ...more scenes...                       │
│                                          │
│            vidiq.app                     │
└──────────────────────────────────────────┘
```

---

## 🧱 Tech Stack

| Layer          | Technology                                |
|----------------|-------------------------------------------|
| **Web App**    | Vite (React), TypeScript                  |
| **Styling**    | Vanilla CSS + CSS Variables               |
| **Backend**    | Convex (serverless)                       |
| **AI/Vision**  | NVIDIA AI (Cosmos, Kimi, Nemotron, etc.)  |
| **Auth**       | Convex Auth                               |
| **Storage**    | Convex File Storage                       |
| **Mobile**     | React Native (Expo) — Phase 3             |
| **Analytics**  | PostHog                                   |

---

## 📂 Project Structure

```
vidiq/
├── README.md                 # This file
├── FEATURES.md               # Detailed feature specifications
├── ROADMAP.md                # Development roadmap & milestones
├── ARCHITECTURE.md           # System architecture & data flow
├── BRANDING.md               # Brand guidelines, tone, naming
├── MONETIZATION.md           # Business model & revenue strategy
├── VIRAL-STRATEGY.md         # Growth loops & launch plan
├── docs/
│   ├── api-design.md         # API endpoints & contracts
│   ├── ai-pipeline.md        # AI model pipeline architecture
│   └── safety-guidelines.md  # Content safety & responsible AI
└── web/                      # Web app
```

---

## 🚀 Quick Start

```bash
cd web
npm install
npm run dev
```

Set `VITE_CONVEX_URL` in `.env.local` and run `npx convex dev` to connect the backend.

---

## 📜 License

Proprietary — All rights reserved.
