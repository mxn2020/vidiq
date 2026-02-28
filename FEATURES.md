# 🧩 VidIQ — Feature Specifications

## Core Features

### 1. Video Upload & URL Import

**Description:** Users upload a video file or paste a YouTube URL. The system processes and sends it for AI analysis.

**User Flow:**
1. Tap "Analyze Video" → file picker or URL input
2. Select video file (or paste YouTube URL)
3. Loading screen with "Decoding your video frame by frame…" copy
4. Analysis timeline appears with results

**Technical Requirements:**
- Accept MP4, MOV, WebM, AVI up to 100MB
- YouTube URL validation and server-side download
- Client-side video thumbnail extraction
- Store original in Convex File Storage
- Frame sampling at configurable FPS (default: 4)
- Progress indicator during upload & processing

---

### 2. AI Analysis Engine

**Description:** The core analysis system that processes video frames and generates timestamped scene narratives.

**Analysis Pipeline:**
| Stage               | Method                        | Output              |
|----------------------|-------------------------------|----------------------|
| Frame extraction     | 4 FPS sampling                | Frame batch          |
| Scene detection      | Visual similarity grouping    | Scene boundaries     |
| Object identification| Vision model detection        | Objects per scene    |
| Brand recognition    | Logo/text detection           | Brand list           |
| Action recognition   | Motion + context analysis     | Action descriptions  |
| Person detection     | Human presence analysis       | Person count/context |
| Narrative generation | Chain-of-thought reasoning    | Scene descriptions   |

**Output Structure:**
- **Summary** — overall video description (2-3 paragraphs)
- **Scene Timeline** — timestamped scene-by-scene breakdown
- **Objects Detected** — list of identified objects with confidence
- **Brands Detected** — logos, text, sponsorships
- **Key Actions** — notable actions/events with timestamps
- **Duration** — total video length
- **Scenes Count** — number of distinct scenes

**AI Models (Tier 1 — Core Video Understanding):**

| Model                    | Strength                                    |
|--------------------------|---------------------------------------------|
| cosmos-reason2-8b        | Physics-aware video reasoning + timestamps  |
| kimi-k2.5               | 1T MoE — long complex videos               |
| nemotron-nano-12b-v2-vl  | Multi-image/video understanding, Q&A        |
| cosmos-nemotron-34b      | Text/image/video, informative responses     |
| llama-3.2-90b-vision     | Strong vision-language reasoning            |
| llama-3.2-11b-vision     | Lighter weight, faster passes               |

---

### 3. Scene Timeline Card (Share-Ready)

**Description:** The output is a beautifully designed, shareable scene timeline.

**Design Requirements:**
- Dark background with gradient (deep navy → black)
- Horizontal timeline visualization
- Scene thumbnails with timestamps
- Brand watermark "vidiq.app" subtle bottom corner
- One-tap share / download as image
- Responsive — works on mobile and desktop

**Timeline Layout:**
```
┌──────────────────────────────────────────┐
│                                          │
│  🎬 Video Analysis                       │
│                                          │
│  Duration: 00:44  |  Scenes: 14          │
│  Objects: 23      |  Brands: 3           │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  ┌─────────────┐                         │
│  │ 00:00-00:02 │  Opening Scene          │
│  │ [thumbnail] │  Outdoor racing event   │
│  │             │  on a sunny day. A red  │
│  │             │  race car leads others.  │
│  └─────────────┘                         │
│                                          │
│  ┌─────────────┐                         │
│  │ 00:02-00:06 │  Cockpit View           │
│  │ [thumbnail] │  Two occupants in full  │
│  │             │  protective gear.        │
│  └─────────────┘                         │
│                                          │
│  ...more scenes...                       │
│                                          │
│            vidiq.app                     │
└──────────────────────────────────────────┘
```

---

### 4. User Accounts & History

**Description:** Optional accounts to track analysis history and manage credits.

**Features:**
- Sign up with email/password
- View past analyses
- Re-access any previous analysis
- Profile with total analyses count
- Delete account & data (GDPR)

---

### 5. Custom Prompts

**Description:** Power users can customize what the AI looks for in their videos.

**Flow:**
1. User uploads video
2. Optionally adds a custom prompt: "Focus on the sports equipment"
3. AI uses the custom prompt to guide its analysis
4. Results are tailored to the user's request

---

### 6. Export & Sharing

**Description:** Multiple export formats for analysis results.

**Features:**
- Copy analysis as structured text
- Download as JSON
- Download scene timeline as image (html2canvas)
- Share link to analysis (public/private toggle)
- Embed widget for websites

---

## Feature Priority Matrix

| Feature                  | Phase | Priority | Effort |
|--------------------------|-------|----------|--------|
| Video Upload             | 1     | P0       | Medium |
| YouTube URL Import       | 1     | P0       | Medium |
| AI Analysis Engine       | 1     | P0       | High   |
| Scene Timeline Card      | 1     | P0       | Medium |
| User Accounts            | 1     | P1       | Medium |
| Analysis History         | 1     | P1       | Low    |
| Custom Prompts           | 2     | P1       | Medium |
| Export Formats           | 2     | P1       | Low    |
| Batch Video Analysis     | 2     | P2       | High   |
| API Access               | 3     | P2       | High   |
| Mobile App (iOS)         | 3     | P1       | High   |
| Mobile App (Android)     | 3     | P1       | High   |
