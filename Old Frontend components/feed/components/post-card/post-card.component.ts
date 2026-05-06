import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from '../comment/comment.component';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  toxicityThreshold: number;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  toxicityScore: number;
  createdAt: Date;
  likesCount: number;
  isLiked: boolean;
  replies: Comment[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  toxicityScore: number;
  category: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  comments?: Comment[];
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() currentUser!: User;
  @Output() likeToggle = new EventEmitter<Post>();
  @Output() commentAdded = new EventEmitter<{ post: Post; comment: string }>();

  showComments = false;
  newCommentText = '';

  getToxicityBadgeClass(score: number): string {
    if (score <= 25) return 'badge--safe';
    if (score <= 50) return 'badge--mild';
    if (score <= 75) return 'badge--mature';
    return 'badge--toxic';
  }

  getToxicityLabel(score: number): string {
    if (score <= 25) return 'Safe';
    if (score <= 50) return 'Mild';
    if (score <= 75) return 'Mature';
    return 'Toxic';
  }

  onLikeToggle(): void {
    this.likeToggle.emit(this.post);
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

  addComment(): void {
    if (!this.newCommentText.trim()) return;
    this.commentAdded.emit({ post: this.post, comment: this.newCommentText });
    this.newCommentText = '';
  }

  onNestedReply(event: { parentComment: Comment; reply: string }): void {
    // Handle nested reply - in real implementation, this would call a service
    console.log('Nested reply:', event);
  }

  onCommentLikeToggle(comment: Comment): void {
    comment.isLiked = !comment.isLiked;
    comment.likesCount += comment.isLiked ? 1 : -1;
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
