export type ContentType = 'post' | 'comment' | 'story';
export type ModerationStatus = 'approved' | 'flagged' | 'auto_moderated' | 'pending_review';
export type ToxicityTag =
  | 'hate_speech'
  | 'harassment'
  | 'threat'
  | 'profanity'
  | 'spam'
  | 'misinformation';

export interface ContentAuthor {
  name: string;
  username: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface ContentToxicity {
  detected: boolean;
  tags: ToxicityTag[];
  severity: number;
  status: ModerationStatus;
}

export interface ContentEngagement {
  likes: number;
  shares: number;
  replies: number;
}

export interface FeedItem {
  id: string;
  type: ContentType;
  author: ContentAuthor;
  message: string;
  timestamp: string;
  parentId: string | null;
  toxicity: ContentToxicity;
  engagement: ContentEngagement;
}
