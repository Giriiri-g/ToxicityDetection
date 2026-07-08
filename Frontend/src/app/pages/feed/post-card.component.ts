import { Component, Input, OnInit,  Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { renderMarkdown } from './markdown.util';

export interface ToxicityTag { label: string; }

const TAG_COLORS: Record<string, string> = {
  'toxic': '#ef4444', 'severe_toxic': '#dc2626', 'obscene': '#f97316',
  'threat': '#b91c1c', 'insult': '#f59e0b', 'identity_hate': '#8b5cf6',
  'hate': '#8b5cf6', 'nsfw': '#ec4899', 'spam': '#6366f1', 'controversial': '#3b82f6',
};
const DEFAULT_TAG_COLOR = '#64748b';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  @Input() postId: string = '';
  @Input() depth: number = 0;          // 0 = top-level post, 1+ = comment
  @Input() isLikedByUser: boolean = false;
  @Input() isBlurred: boolean = false;
  @Output() commentPosted = new EventEmitter<void>();
  blurDismissed = false;
  @ViewChild('commentBodyArea') commentBodyArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('commentFileInput') commentFileInput!: ElementRef<HTMLInputElement>;

  
  // ── Comment modal state ───────────────────────────────────────────────────
  commentModalOpen = false;
  commentBody = '';
  submittingComment = false;
  commentMediaPreviewUrl: string | null = null;
  commentLink = '';
  
  constructor(private router: Router, private postService: PostService) {}

  get iconFallbackLetter(): string {
    return this.username?.charAt(0).toUpperCase() ?? '?';
  }

  get messageHtml(): string { return renderMarkdown(this.message); }

  tagColor(label: string): string {
    return TAG_COLORS[label.toLowerCase()] ?? DEFAULT_TAG_COLOR;
  }

  get indentPx(): string { return `${this.depth * 24}px`; }

  navigateToDetail(): void {
    if (this.postId) this.router.navigate(['/feed/p', this.postId]);
  }

  wrapComment(before: string, after: string): void {
    const ta = this.commentBodyArea.nativeElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = this.commentBody.substring(start, end);
    this.commentBody =
      this.commentBody.substring(0, start) +
      before + selected + after +
      this.commentBody.substring(end);
    setTimeout(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = end + before.length;
      ta.focus();
    });
  }

  onCommentMediaSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.commentMediaPreviewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeCommentMedia(): void {
    this.commentMediaPreviewUrl = null;
    this.commentFileInput.nativeElement.value = '';
  }

  openCommentModal(event: Event): void {
    event.stopPropagation();   // don't trigger navigateToDetail
    this.commentModalOpen = true;
  }

  closeCommentModal(): void {
    this.commentModalOpen = false;
    this.commentBody = '';
    this.commentLink = '';
    this.commentMediaPreviewUrl = null;
  }

  submitComment(): void {
    const body = this.commentBody.trim();
    if (!body || this.submittingComment || !this.postId) return;
    this.submittingComment = true;

    this.postService.createPost({
      message: body,
      PPID: this.postId,
      thread: this.thread || undefined,
      mediaUrl: this.commentMediaPreviewUrl || undefined,
      linkUrl: this.commentLink || undefined,
    }).subscribe({
      next: () => {
        this.submittingComment = false;
        this.closeCommentModal();
        this.commentPosted.emit();   // update signal for the feed detail component to refresh post array
      },
      error: (err) => {
        console.error('Error submitting comment:', err);
        this.submittingComment = false;
      }
    });
  }

  get previewHtml(): string { return renderMarkdown(this.commentBody); }
  
  dismissBlur(event: Event): void {
    event.stopPropagation();
    this.blurDismissed = true;
  }
}