# 🏗️ VidIQ — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├──────────────────────┬──────────────────────────────────────┤
│    Web App           │    Mobile App (Phase 3)              │
│    Vite + React      │    React Native (Expo)               │
│    TypeScript        │    Shared logic via packages         │
└──────────┬───────────┴──────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONVEX BACKEND                         │
├─────────────────────────────────────────────────────────────┤
│  Queries     │  Mutations    │  Actions       │  Cron Jobs  │
│  - getAnal.  │  - saveAnal.  │  - analyzeVid  │  - cleanup  │
│  - getUser   │  - createUser │  - extractFrm  │  - digest   │
│  - history   │  - updateCred │                │             │
├─────────────────────────────────────────────────────────────┤
│                    Convex Database                           │
│  Tables: users, analyses, credits, aiLogs, modelCosts       │
├─────────────────────────────────────────────────────────────┤
│                    Convex File Storage                       │
│  Uploaded videos, extracted frames, analysis exports        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
├──────────────────┬──────────────────┬───────────────────────┤
│  NVIDIA AI       │  PostHog         │  Stripe               │
│  (Cosmos/Kimi/   │  Analytics       │  Payments (Phase 2)   │
│   Nemotron/etc.) │                  │                       │
└──────────────────┴──────────────────┴───────────────────────┘
```

---

## Data Flow

### Video Analysis Flow

```
1. User uploads video (or provides YouTube URL)
   └→ Client validates format & size
      └→ Upload to Convex File Storage
         └→ Convex Action: analyzeVideo()
            ├→ Fetch video from storage
            ├→ Sample frames at 4 FPS
            ├→ Send frames to NVIDIA Vision API
            ├→ Run chain-of-thought reasoning
            ├→ Parse timestamped scene descriptions
            ├→ Generate structured analysis object
            └→ Store analysis in DB
               └→ Return analysis to client
                  └→ Render scene timeline
```

### YouTube URL Flow

```
1. User pastes YouTube URL
   └→ Validate URL format
      └→ Server-side download & extraction
         └→ Same analysis pipeline as file upload
```

---

## Database Schema (Convex)

### `userProfiles`
| Field           | Type     | Description                |
|-----------------|----------|----------------------------|
| `userId`        | string   | References auth users._id  |
| `name`          | string?  | Display name               |
| `role`          | string   | "user" / "admin"           |
| `totalAnalyses` | number   | Count of analyses          |
| `creditBalance` | number?  | Current credits            |
| `plan`          | string?  | "free" / "paid"            |
| `createdAt`     | number   | Timestamp                  |

### `analyses`
| Field              | Type     | Description                  |
|--------------------|----------|------------------------------|
| `userId`           | Id?      | Optional (anonymous allowed) |
| `videoStorageId`   | Id?      | Ref to uploaded video        |
| `youtubeUrl`       | string?  | YouTube source URL           |
| `title`            | string   | Video/analysis title         |
| `duration`         | number   | Video duration in seconds    |
| `fps`              | number   | Sampling FPS used            |
| `scenesJson`       | string   | JSON array of scene objects  |
| `totalScenes`      | number   | Number of scenes detected    |
| `objectsDetected`  | number   | Total objects identified     |
| `brandsDetected`   | string?  | JSON array of brand names    |
| `summary`          | string   | Overall video summary        |
| `aiRawResponse`    | string   | Raw AI response              |
| `model`            | string   | Model used for analysis      |
| `status`           | string   | "pending"/"complete"/"error" |
| `createdAt`        | number   | Timestamp                    |

### `creditTransactions`
| Field           | Type     | Description                |
|-----------------|----------|----------------------------|
| `userId`        | string   | User ID                    |
| `type`          | string   | purchase/refill/deduct/etc |
| `amount`        | number   | +/- credit change          |
| `balanceBefore` | number   | Balance before transaction |
| `balanceAfter`  | number   | Balance after transaction  |
| `description`   | string   | Human-readable description |
| `timestamp`     | number   | Timestamp                  |

### `aiLogs`
| Field            | Type     | Description                |
|------------------|----------|----------------------------|
| `requestId`      | string   | Unique request identifier  |
| `model`          | string   | Model used                 |
| `caller`         | string   | Function that made the call|
| `timestamp`      | number   | When the call was made     |
| `durationMs`     | number   | Request duration           |
| `status`         | string   | success/error              |
| `promptTokens`   | number?  | Input tokens               |
| `completionTokens`| number? | Output tokens              |
| `totalCostUsd`   | number?  | Estimated cost             |

---

## API Design (Convex Functions)

### Queries
- `analyses.getById(id)` — Fetch single analysis
- `analyses.getByUser(userId)` — User's analysis history
- `analyses.getRecent(limit)` — Recent public analyses
- `users.getProfile(userId)` — User profile + stats

### Mutations
- `users.create(data)` — Create new user
- `analyses.save(data)` — Store analysis
- `credits.deduct(userId, amount)` — Deduct credits

### Actions
- `nvidia.analyzeVideo(storageId)` — Run NVIDIA Vision pipeline
- `nvidia.analyzeYouTube(url)` — Download + analyze YouTube video

---

## Security & Privacy

- **Video retention:** Auto-delete uploaded videos after 30 days
- **Anonymous usage:** Allow analyses without account
- **Rate limiting:** Max 5 analyses per hour per IP
- **No PII storage:** Never store personal information from videos
- **GDPR:** Full data export + deletion on request
- **Content moderation:** Reject inappropriate content gracefully
