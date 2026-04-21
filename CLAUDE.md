# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ToxicityGuard** - A social media platform with built-in AI-powered toxicity detection and content moderation.

Unlike traditional social media platforms, ToxicityGuard automatically analyzes all user-generated content (posts, comments, replies) for toxic behavior and gives users control over what they see based on toxicity levels.

- **Version**: 1.0 — Initial Release
- **Stack**: ASP.NET Core C# (Backend), Angular TypeScript (Frontend), MySQL (Data Layer)

## What Makes This Different

This is NOT a moderation service for other platforms. This IS a social media platform where:
- Users create posts, comments, stories
- AI automatically scores every piece of content for toxicity
- Users set personal filters to blur/hide toxic content above their threshold
- Admins configure global toxicity thresholds and moderation rules
- Flagged content goes through review workflows
- Users receive warnings and can appeal decisions

## Core Social Features

- **Feed**: Personalized content stream with toxicity filtering
- **Posts**: Text, images, stories with real-time toxicity scoring
- **Comments**: Nested reply threads with toxicity indicators
- **User Profiles**: Bio, posts, history, moderation record
- **Follow System**: Follow users, see their content
- **Stories**: Ephemeral content (24h) with toxicity checks
- **Notifications**: Likes, comments, warnings, appeals
- **Messages**: Direct messaging with toxicity filtering
- **Search**: Find users and content

## Project Structure

```
ToxicityDetection/
├── backend/                    # ASP.NET Core Web API
│   ├── Controllers/           # API endpoints (Posts, Users, Comments, etc.)
│   ├── Services/              # Business logic (Feed, Moderation, AI)
│   ├── Models/                # Entity classes
│   └── Data/                  # EF Core DbContext
├── frontend/                   # Angular SPA
│   ├── src/app/
│   │   ├── pages/
│   │   │   ├── feed/          # Main content feed
│   │   │   ├── profile/       # User profiles
│   │   │   ├── post/          # Single post view
│   │   │   ├── create/        # Create post/story
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── auth/          # Login, signup, forgot password
│   │   │   └── settings/      # User settings & preferences
│   │   ├── components/
│   │   │   ├── header/        # Navigation header
│   │   │   ├── post-card/     # Post in feed
│   │   │   ├── comment/       # Comment thread
│   │   │   ├── toxicity-badge/# Toxicity indicator
│   │   │   ├── story/         # Story component
│   │   │   └── sidebar/       # Navigation sidebar
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── feed.service.ts
│   │       ├── post.service.ts
│   │       └── theme.service.ts
│   └── angular.json
├── ai-service/                 # Python FastAPI service
│   └── app.py                 # LLM-based toxicity detection
└── database/
    └── schema.sql             # MySQL schema
```

## Key Features

### User-Facing
- **Feed**: Infinite scroll with toxicity-based filtering
- **Create Post**: Text/image posts with live toxicity preview
- **Content Warnings**: Blur toxic content above user's threshold
- **Personal Filters**: Users set their own toxicity tolerance (0-100%)
- **Toxicity Badges**: Visual indicators on posts (Safe/Mild/Mature/Toxic)
- **User Profiles**: View own posts, moderation history, strikes
- **Appeals**: Challenge moderation decisions

### Admin/Moderation
- **Dashboard**: Stats, flagged content queue, user reports
- **Threshold Controls**: Set global toxicity thresholds
- **Category Rules**: Different thresholds for hate speech vs profanity
- **Auto-Actions**: Auto-hide/remove based on severity
- **Manual Review**: Queue for human moderators
- **User Strikes**: Warning system, temporary restrictions

### Content Types
- **Posts**: Text + optional image
- **Comments**: Nested replies (3 levels deep)
- **Stories**: 24h ephemeral content
- **Reactions**: Like, heart, angry, sad
- **Shares**: Repost to own feed

## Development Pipeline

Build in this order:

1. **UI First** - Landing page, feed, post creation, profiles (mock data)
2. **AI Service** - Toxicity detection endpoint
3. **Core Backend** - Posts, comments, users, feed generation
4. **Moderation** - Admin panel, flagging, review workflows
5. **Real-time** - Notifications, live updates

## Common Development Commands

### Backend (ASP.NET Core)

```bash
# Build
dotnet build

# Run development server
dotnet run --project backend

# Add EF migration
dotnet ef migrations add MigrationName
dotnet ef database update

# Run tests
dotnet test
```

### Frontend (Angular)

```bash
# Install dependencies
cd frontend && npm install

# Serve development server
ng serve

# Build
ng build

# Run tests
ng test
```

### AI Service (Python)

```bash
# Setup
cd ai-service
pip install -r requirements.txt

# Run
python app.py
```

## Core Data Models

### Users Table
- `UserId`, `Username`, `Email`, `PasswordHash`
- `DisplayName`, `Bio`, `AvatarUrl`
- `ToxicityThreshold` (0-100, user's personal filter)
- `Role`: User, Moderator, Admin
- `StrikeCount`, `Status`: Active, Suspended, Banned
- `CreatedAt`, `LastActive`

### Posts Table
- `PostId`, `AuthorId`, `Content`
- `ImageUrl` (optional)
- `ToxicityScore` (0-100), `Category` (HateSpeech, Profanity, etc.)
- `Status`: Active, Hidden, Removed, UnderReview
- `CreatedAt`, `UpdatedAt`
- `LikesCount`, `CommentsCount`, `SharesCount`

### Comments Table
- `CommentId`, `PostId`, `AuthorId`
- `ParentCommentId` (for nested replies)
- `Content`, `ToxicityScore`, `Category`
- `Status`: Active, Hidden, Removed
- `CreatedAt`

### Stories Table
- `StoryId`, `AuthorId`, `ImageUrl`
- `ToxicityScore`, `Status`
- `CreatedAt`, `ExpiresAt` (24h from creation)

### Interactions Table
- `InteractionId`, `UserId`, `PostId`
- `Type`: Like, Heart, Angry, Sad
- `CreatedAt`

### Flags Table
- `FlagId`, `ContentId`, `ContentType` (Post/Comment)
- `FlaggedBy`, `FlagReason`
- `Status`: Pending, Reviewed, Dismissed
- `ModeratorId`, `Decision`, `Notes`

### Warnings Table
- `WarningId`, `UserId`, `ContentId`
- `Reason`, `StrikeIncrement`
- `CreatedAt`, `AcknowledgedAt`

### Appeals Table
- `AppealId`, `WarningId`, `ContentId`
- `Reason`, `Status`: Pending, Approved, Rejected
- `SubmittedAt`, `ResolvedAt`, `ModeratorNotes`

## AI/ML Integration

### Toxicity Detection Endpoint (Python FastAPI)

**POST** `/analyze`
```json
{
  "content": "text to analyze",
  "content_type": "post|comment"
}
```

**Response:**
```json
{
  "score": 75,
  "category": "Harassment",
  "confidence": 0.92,
  "reasoning": "Contains targeted insults"
}
```

### Categories
- **Toxicity** (general)
- **Hate Speech** (targeted attacks on protected groups)
- **Profanity** (vulgar language)
- **Threats** (violence, harm)
- **Harassment** (targeted abuse)
- **Spam** (unsolicited commercial)

### Guardrails
- Max content length: 2000 chars (posts), 500 chars (comments)
- Profanity pre-filter
- Prompt injection protection
- Score validation (0-100 range)

## Feed Algorithm

1. Fetch posts from followed users + trending content
2. Calculate visibility score: `100 - toxicity_score`
3. Apply user's threshold filter: hide if `toxicity > user_threshold`
4. Apply global admin rules: hide if `toxicity > global_threshold`
5. Sort by recency + engagement

## Content Visibility Rules

**For Content Creator:**
- Always sees own content
- Sees toxicity scores on own posts

**For Other Users:**
- Content below user's threshold: fully visible
- Content above user's threshold: blurred with warning
- Content above global threshold: hidden (with "content removed" message)

**For Moderators:**
- See all content including flagged/removed
- See detailed toxicity breakdown

## Environment Configuration

```bash
# Database
MYSQL_CONNECTION_STRING="Server=localhost;Database=ToxicityDb;..."

# AI Service
AI_SERVICE_URL="http://localhost:8000"
LLM_API_KEY="..."

# Auth
JWT_SECRET="..."
JWT_ISSUER="ToxicityGuard"

# File Storage (for images)
STORAGE_PATH="..."

# Email (for notifications)
SMTP_HOST="..."
SENDGRID_API_KEY="..."
```

## Testing

- **Unit Tests**: xUnit (C#), Jasmine (Angular)
- **Integration Tests**: Testcontainers for MySQL
- **AI Tests**: Sample toxic/non-toxic content validation
- **E2E Tests**: User flows (create post, filter content, appeal)

## Implementation Notes

- All user content is scored before being visible to others
- Soft delete content (keep in DB for appeals/audits)
- Rate limiting: 10 posts/hour, 100 comments/hour per user
- Image uploads: Max 5MB, scanned for toxicity via OCR
- Real-time updates via SignalR for new posts/comments
- Search: Full-text on posts, users by username/display name
