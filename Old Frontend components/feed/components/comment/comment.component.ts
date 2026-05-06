import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, Comment } from '../post-card/post-card.component';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() comment!: Comment;
  @Input() currentUser!: User;
  @Input() depth = 0;
  @Output() replyAdded = new EventEmitter<{ parentComment: Comment; reply: string }>();
  @Output() likeToggle = new EventEmitter<Comment>();

  showReplyForm = false;
  replyText = '';

  readonly maxDepth = 3;

  getToxicityBadgeClass(score: number): string {
    if (score <= 25) return 'badge--safe';
    if (score <= 50) return 'badge--mild';
    if (score <= 75) return 'badge--mature';
    return 'badge--toxic';
  }

  onLikeToggle(): void {
    this.likeToggle.emit(this.comment);
  }

  toggleReplyForm(): void {
    if (this.depth >= this.maxDepth) return;
    this.showReplyForm = !this.showReplyForm;
  }

  submitReply(): void {
    if (!this.replyText.trim()) return;
    this.replyAdded.emit({ parentComment: this.comment, reply: this.replyText });
    this.replyText = '';
    this.showReplyForm = false;
  }

  onNestedReply(event: { parentComment: Comment; reply: string }): void {
    this.replyAdded.emit(event);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }
}
