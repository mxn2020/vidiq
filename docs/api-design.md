# 📡 VidIQ — API Design

## Convex Functions

### Queries

#### `analyses.getById`
```typescript
analyses.getById({ id: Id<"analyses"> }) → Analysis | null
```
Fetch a single analysis by ID.

#### `analyses.getByUser`
```typescript
analyses.getByUser({ userId: string }) → Analysis[]
```
Fetch all analyses for a user, ordered by creation date (newest first).

#### `analyses.getRecent`
```typescript
analyses.getRecent({ limit?: number }) → Analysis[]
```
Fetch recent public analyses. Default limit: 20.

#### `users.getProfile`
```typescript
users.getProfile() → UserProfile | null
```
Fetch the current user's profile including stats.

#### `credits.getBalance`
```typescript
credits.getBalance() → { balance: number, plan: string }
```
Fetch the current user's credit balance and plan.

#### `credits.getTransactions`
```typescript
credits.getTransactions({ limit?: number }) → CreditTransaction[]
```
Fetch the user's credit transaction history.

#### `aiLogs.list`
```typescript
aiLogs.list({ limit?: number }) → AiLog[]
```
Admin only. List recent AI request logs.

---

### Mutations

#### `analyses.save`
```typescript
analyses.save({
  videoStorageId?: Id<"_storage">,
  youtubeUrl?: string,
  title: string,
  duration: number,
  fps: number,
  scenesJson: string,
  totalScenes: number,
  objectsDetected: number,
  brandsDetected?: string,
  summary: string,
  aiRawResponse: string,
  model: string,
  status: string,
}) → Id<"analyses">
```
Store a completed analysis result.

#### `users.createOrUpdate`
```typescript
users.createOrUpdate({
  name?: string,
}) → Id<"userProfiles">
```
Create or update the current user's profile.

#### `credits.deduct`
```typescript
credits.deduct({
  amount: number,
  description: string,
}) → { success: boolean, balanceAfter: number }
```
Deduct credits for an analysis.

---

### Actions

#### `nvidia.analyzeVideo`
```typescript
nvidia.analyzeVideo({
  storageId: Id<"_storage">,
  model?: string,
  customPrompt?: string,
}) → AnalysisResult
```
Run the NVIDIA AI pipeline on an uploaded video. Returns structured analysis.

#### `nvidia.analyzeYouTube`
```typescript
nvidia.analyzeYouTube({
  url: string,
  model?: string,
  customPrompt?: string,
}) → AnalysisResult
```
Download a YouTube video and run the analysis pipeline.

---

## Types

### `Analysis`
```typescript
{
  _id: Id<"analyses">
  userId?: string
  videoStorageId?: Id<"_storage">
  youtubeUrl?: string
  title: string
  duration: number
  fps: number
  scenesJson: string    // JSON array of Scene objects
  totalScenes: number
  objectsDetected: number
  brandsDetected?: string
  summary: string
  aiRawResponse: string
  model: string
  status: "pending" | "processing" | "complete" | "error"
  errorMessage?: string
  createdAt: number
}
```

### `Scene`
```typescript
{
  startTime: string     // "MM:SS" format
  endTime: string       // "MM:SS" format
  title: string         // Short scene title
  description: string   // Detailed scene description
  objects?: string[]    // Objects detected in scene
  actions?: string[]    // Actions identified
}
```

### `UserProfile`
```typescript
{
  _id: Id<"userProfiles">
  userId: string
  name?: string
  role: "user" | "admin"
  totalAnalyses: number
  creditBalance?: number
  plan?: "free" | "paid"
  createdAt: number
}
```
