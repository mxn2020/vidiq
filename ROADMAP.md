# 🗺️ VidIQ — Development Roadmap

## Overview

The roadmap is structured in 3 phases, prioritizing the web app MVP and core analysis flow first, then expanding to advanced features and mobile.

---

## Phase 1 — Web App MVP (Weeks 1–4)

> **Goal:** Launchable web app with core video analysis + sharing.

### Week 1: Foundation
- [ ] Initialize Vite + React project with TypeScript
- [ ] Set up Convex backend (schema, functions)
- [ ] Design system: CSS variables, typography, dark theme
- [ ] Landing page with hero + CTA
- [ ] Basic responsive layout (mobile-first)

### Week 2: Core Flow
- [ ] Video upload component (drag & drop + file picker)
- [ ] YouTube URL input + validation
- [ ] Convex file storage integration
- [ ] NVIDIA Vision API integration with provider abstraction
- [ ] Frame sampling engine (4 FPS)
- [ ] Loading screen with progress indicators

### Week 3: Analysis Output
- [ ] Scene timeline component
- [ ] Scene card component (timestamp + description)
- [ ] Analysis export as image (html2canvas)
- [ ] Copy/download as structured text/JSON
- [ ] SEO meta tags + Open Graph for shared links

### Week 4: Auth & Polish
- [ ] Authentication (Convex Auth)
- [ ] User profile & analysis history
- [ ] Credit system (free tier limits)
- [ ] Error handling, edge cases, loading states
- [ ] Analytics integration (PostHog)
- [ ] Rate limiting & abuse prevention

### Phase 1 Deliverables
- ✅ Working web app at vidiq.app
- ✅ Video → AI analysis → timestamped timeline
- ✅ User accounts with history
- ✅ Credit system
- ✅ Analytics tracking

---

## Phase 2 — Growth & Features (Weeks 5–8)

> **Goal:** Custom prompts, batch processing, API access.

### Week 5: Custom Prompts
- [ ] Custom prompt input during upload
- [ ] Prompt templates library
- [ ] Save favorite prompts
- [ ] A/B test different analysis depths

### Week 6: Advanced AI
- [ ] Multi-model comparison (run same video through different models)
- [ ] Improved scene boundary detection
- [ ] Object tracking across scenes
- [ ] Sentiment/emotion analysis per scene
- [ ] Feedback loop: "Was this accurate?" → improve model

### Week 7: Export & Integration
- [ ] PDF export of analysis
- [ ] Subtitle/SRT file generation
- [ ] Embed widget for websites
- [ ] API access for developers
- [ ] Webhook notifications on analysis complete

### Week 8: Batch & Team
- [ ] Batch video upload (process multiple)
- [ ] Team workspaces
- [ ] Shared analysis collections
- [ ] Folder organization

### Phase 2 Deliverables
- ✅ Custom prompts working
- ✅ Multi-model comparison
- ✅ API access available
- ✅ Batch processing
- ✅ Team features

---

## Phase 3 — Mobile & Monetization (Weeks 9–16)

> **Goal:** Native mobile apps + sustainable revenue.

### Weeks 9–12: Mobile Apps
- [ ] React Native (Expo) project setup
- [ ] Shared business logic from web app
- [ ] Native camera/video capture
- [ ] Push notifications (native)
- [ ] App Store submission (iOS)
- [ ] Play Store submission (Android)

### Weeks 13–14: Monetization
- [ ] Freemium model implementation
- [ ] Premium features (see MONETIZATION.md)
- [ ] Stripe integration
- [ ] Usage-based billing for API

### Weeks 15–16: Scale
- [ ] Enterprise self-hosted option
- [ ] Custom model training
- [ ] Performance optimization
- [ ] CDN for video processing

### Phase 3 Deliverables
- ✅ iOS and Android apps live
- ✅ Revenue streams active
- ✅ API marketplace
- ✅ Scalable infrastructure

---

## Success Metrics

| Metric                   | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------------------------|----------------|----------------|----------------|
| Monthly Active Users     | 500            | 5,000          | 50,000         |
| Analyses per day         | 25             | 250            | 2,500          |
| Share rate               | 20%            | 30%            | 40%            |
| API adoption             | —              | 50 devs        | 500 devs       |

---

## Risk Mitigation

| Risk                          | Mitigation                                      |
|-------------------------------|--------------------------------------------------|
| AI API costs too high         | Cache results, set limits, use efficient models  |
| Large video processing slow   | Frame sampling, progressive loading, async       |
| Copyright concerns            | Clear ToS, no storage of copyrighted content     |
| Data privacy                  | Auto-delete videos, GDPR compliance              |
| Low adoption                  | A/B test UX, iterate on value proposition        |
