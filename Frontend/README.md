# ToxiGuard — AI Toxic Content Detection · Frontend Demo

Angular 17 demo frontend for the AI Toxic Content Detection Platform.
Simulates a social media feed with real-time toxicity tagging and severity scoring.

---

## Tech Stack

- **Framework**: Angular 17 (standalone components, signals)
- **Styling**: SCSS with CSS custom properties (light/dark theming)
- **Fonts**: Syne (display) · Crimson Pro (body)
- **Data**: Static JSON feed at `src/assets/data/feed.json`

---

## Quick Start

```bash
npm install
npm start
# → http://localhost:4200
```

---

## Project Structure

```
src/
├── assets/
│   └── data/
│       └── feed.json              # Content feed data source
├── app/
│   ├── models/
│   │   └── content.model.ts       # FeedItem, ContentToxicity, etc.
│   ├── services/
│   │   ├── feed.service.ts        # Loads feed.json via HttpClient
│   │   └── theme.service.ts       # Dark/light mode toggle (signal-based)
│   └── components/
│       ├── navbar/                # Top navigation + theme toggle
│       ├── feed/                  # Feed container, stories rail, filter tabs
│       ├── post-card/             # Renders post / comment / reply cards
│       ├── story-card/            # Horizontal story bubbles with hover preview
│       └── toxicity-badge/        # Severity bar, tags, moderation status
├── styles.scss                    # Global theme variables (light + dark)
└── index.html
```

---

## Feed JSON Schema

Add or edit entries in `src/assets/data/feed.json`:

```jsonc
{
  "id": "p001",
  "type": "post",           // "post" | "comment" | "reply" | "story"
  "author": {
    "name": "Display Name",
    "username": "handle",
    "avatarInitials": "DN",
    "avatarColor": "#6BA3BE"
  },
  "message": "Content text here.",
  "timestamp": "2025-04-07T09:00:00Z",
  "parentId": null,         // null for root content, or parent item "id"
  "toxicity": {
    "detected": true,
    "tags": ["harassment", "hate_speech"],  // see ToxicityTag type
    "severity": 84,                          // 0–100
    "status": "auto_moderated"               // "approved" | "flagged" | "auto_moderated" | "pending_review"
  },
  "engagement": {
    "likes": 12,
    "shares": 0,
    "replies": 5
  }
}
```

### Available Toxicity Tags
`hate_speech` · `harassment` · `threat` · `profanity` · `spam` · `misinformation`

### Moderation Statuses
| Status | Behaviour |
|---|---|
| `approved` | Shown normally |
| `flagged` | Toxicity panel shown, content visible |
| `pending_review` | Toxicity panel shown, content visible |
| `auto_moderated` | Content blurred with moderation notice |

---

## Color Palette

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F2EEE9` warm off-white | `#111111` deep dark |
| `--surface` | `#FFFFFF` | `#1C1C1C` |
| `--surface-raised` | `#F5F1EC` | `#252525` |
| `--cloud-blue` | `#6BA3BE` | `#7AADCA` |
| `--brown-gray` | `#C4B5A5` | `#8C7B6C` |
| `--accent` | `#C41E3A` blood red | `#E03050` blood red |

---

## Connecting to the ASP.NET Core Backend

Replace the static JSON fetch in `FeedService` with a live API call:

```typescript
// src/app/services/feed.service.ts
getFeed(): Observable<FeedItem[]> {
  return this.http.get<FeedItem[]>('https://your-api/api/content/feed');
}
```
