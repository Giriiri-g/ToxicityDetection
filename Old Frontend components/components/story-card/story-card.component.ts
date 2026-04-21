import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedItem } from '../../models/content.model';
import { ToxicityBadgeComponent } from '../toxicity-badge/toxicity-badge.component';

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [CommonModule, ToxicityBadgeComponent],
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss']
})
export class StoryCardComponent {
  @Input() item!: FeedItem;

  get timeAgo(): string {
    return formatTimeAgo(this.item.timestamp);
  }
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}h`;
  return `${Math.floor(diffH / 24)}d`;
}
