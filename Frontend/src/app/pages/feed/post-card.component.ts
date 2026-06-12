import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToxicityTag {
  label: string;
}

/** Static color map: tag label → CSS hex color */
const TAG_COLORS: Record<string, string> = {
  'toxic':          '#ef4444',
  'severe_toxic':   '#dc2626',
  'obscene':        '#f97316',
  'threat':         '#b91c1c',
  'insult':         '#f59e0b',
  'identity_hate':  '#8b5cf6',
  'hate':           '#8b5cf6',
  'nsfw':           '#ec4899',
  'spam':           '#6366f1',
  'controversial':  '#3b82f6',
};

const DEFAULT_TAG_COLOR = '#64748b';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
})
export class PostCardComponent {
  @Input() thread: string = '';
  @Input() username: string = '';
  @Input() iconUrl: string = '';
  @Input() timePosted: string = '';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() likeCount: number = 0;
  @Input() commentCount: number = 0;
  @Input() toxicityTags: ToxicityTag[] = [];
  @Input() userVote: 'up' | 'down' | null = null;

  get iconFallbackLetter(): string {
    return this.username?.charAt(0).toUpperCase() ?? '?';
  }

  tagColor(label: string): string {
    return TAG_COLORS[label.toLowerCase()] ?? DEFAULT_TAG_COLOR;
  }
}
