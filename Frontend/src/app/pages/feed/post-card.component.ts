import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToxicityTag {
  label: string;
  severity: 'low' | 'medium' | 'high'; // controls badge color
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
})
export class PostCardComponent {
  /** Community / subreddit name e.g. "r/androidapps" */
  @Input() thread: string = '';

  /** Community icon URL (falls back to first letter avatar) */
  @Input() iconUrl: string = '';

  /** Time since post e.g. "2 days ago" */
  @Input() timePosted: string = '';

  /** Post title */
  @Input() title: string = '';

  /** Post body text */
  @Input() message: string = '';

  /** Upvote count */
  @Input() likeCount: number = 0;

  /** Comment count */
  @Input() commentCount: number = 0;

  /** Toxicity score 0–100 */
  @Input() toxicityScore: number = 0;

  /** Array of toxicity tag objects */
  @Input() toxicityTags: ToxicityTag[] = [];

  /** Whether the current user has upvoted */
  @Input() userVote: 'up' | 'down' | null = null;

  get toxicityLevel(): 'safe' | 'moderate' | 'toxic' {
    if (this.toxicityScore >= 70) return 'toxic';
    if (this.toxicityScore >= 35) return 'moderate';
    return 'safe';
  }

  get iconFallbackLetter(): string {
    return this.thread?.replace(/^r\//, '').charAt(0).toUpperCase() ?? '?';
  }

  get scoreBarColor(): string {
    if (this.toxicityScore >= 70) return '#ef4444';
    if (this.toxicityScore >= 35) return '#f59e0b';
    return '#22c55e';
  }
}
