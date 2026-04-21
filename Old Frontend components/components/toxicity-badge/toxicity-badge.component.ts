import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentToxicity, ModerationStatus, ToxicityTag } from '../../models/content.model';

@Component({
  selector: 'app-toxicity-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toxicity-badge.component.html',
  styleUrls: ['./toxicity-badge.component.scss']
})
export class ToxicityBadgeComponent {
  @Input() toxicity!: ContentToxicity;

  get severityClass(): string {
    const s = this.toxicity.severity;
    if (s >= 80) return 'critical';
    if (s >= 50) return 'high';
    if (s >= 20) return 'medium';
    return 'low';
  }

  get statusLabel(): string {
    const map: Record<ModerationStatus, string> = {
      approved: 'Approved',
      flagged: 'Flagged',
      auto_moderated: 'Auto-Moderated',
      pending_review: 'Pending Review'
    };
    return map[this.toxicity.status];
  }

  tagLabel(tag: ToxicityTag): string {
    const map: Record<ToxicityTag, string> = {
      hate_speech: 'Hate Speech',
      harassment: 'Harassment',
      threat: 'Threat',
      profanity: 'Profanity',
      spam: 'Spam',
      misinformation: 'Misinformation'
    };
    return map[tag];
  }
}
