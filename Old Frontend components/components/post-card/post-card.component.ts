import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedItem } from '../../models/content.model';
import { ToxicityBadgeComponent } from '../toxicity-badge/toxicity-badge.component';
import { formatTimeAgo } from '../story-card/story-card.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, ToxicityBadgeComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() item!: FeedItem;
  @Input() comments: FeedItem[] = [];   // only used when type === 'post'

  liked = false;
  showComments = false;

  get timeAgo(): string { return formatTimeAgo(this.item.timestamp); }
  get typeLabel(): string { return this.item.type.charAt(0).toUpperCase() + this.item.type.slice(1); }

  toggleLike(): void { this.liked = !this.liked; }
  toggleComments(): void { this.showComments = !this.showComments; }

  formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }
}
