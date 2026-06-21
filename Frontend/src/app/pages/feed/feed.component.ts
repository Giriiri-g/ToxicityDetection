import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostCardComponent, ToxicityTag } from './post-card.component';
import { PostService, PostResponse } from '../../services/post.service';
import { renderMarkdown } from './markdown.util';
import { HeaderComponent } from '../landing/header/header.component';

export interface Post {
  postId: string;
  username: string;
  thread: string;
  iconUrl: string;
  timePosted: string;
  title: string;
  message: string;
  likeCount: number;
  commentCount: number;
  toxicityTags: ToxicityTag[];
  userVote: 'up' | 'down' | null;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, HeaderComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit {
  // ── Composer modal state ──────────────────────────────────────────────────
  modalOpen = false;
  postTitle = '';
  postBody = '';
  postLink = '';
  postThread = '';
  mediaPreviewUrl: string | null = null;
  submitting = false;

  // ── Feed state ────────────────────────────────────────────────────────────
  private allPosts: Post[] = [];
  posts: Post[] = [];
  threadCounts: { thread: string; count: number }[] = [];
  selectedThread: string | undefined = undefined;
  hiddenTags: string[] = [];
  postThreadForFilter: string = '';
  togglableTags: string[] = ['NSFW', 'obscene', 'threat', 'insult', 'identity_hate', 'hate']; // Bug found, resolve later (Tags in the backend and the frontend are different, need to match caps)

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bodyArea') bodyArea!: ElementRef<HTMLTextAreaElement>;

  constructor(private postService: PostService) { }


  ngOnInit() {
    this.loadFeed();
    this.loadThreadCounts();
  }

  loadFeed() {
    this.postService.getFeed(1, 20, this.selectedThread).subscribe({
      next: res => {
        try {
          // Safely map the response to UI posts
          const postsArray = Array.isArray(res) ? res : [];
          this.allPosts = postsArray.map(r => this.toUiPost(r));
          this.posts = this.applyFilters(this.allPosts); // Apply filters after loading
          console.log('Feed loaded:', this.posts.length, 'posts');
        } catch (e) {
          console.error('Error processing feed response:', e);
          this.posts = [];
        }
      },
      error: (err) => {
        console.error('Error loading feed:', err);
        this.posts = [];
      }
    });
  }

  loadThreadCounts() {
    this.postService.getThreadCounts().subscribe({
      next: counts => {
        try {
          this.threadCounts = Array.isArray(counts) ? counts : [];
          console.log('Thread counts loaded:', this.threadCounts.length, 'threads');
          console.log(this.threadCounts);
        } catch (e) {
          console.error('Error processing thread counts:', e);
          this.threadCounts = [];
        }
      },
      error: (err) => {
        console.error('Error loading thread counts:', err);
        this.threadCounts = [];
      }
    });
  }

  private applyFilters(posts: Post[]): Post[] {
    try {
      return posts.filter(post => {
        // Thread filter
        if (this.selectedThread !== undefined && this.selectedThread !== '' && post.thread !== this.selectedThread) {
          return false;
        }
        if (this.hiddenTags.length > 0) {
          const postTags = post.toxicityTags.map(t => t.label);
          return !this.hiddenTags.some(tag => postTags.includes(tag));
        }
        return true;
      });
    } catch (e) {
      console.error('Error in applyFilters:', e);
      // If filtering fails, return all posts to avoid breaking the feed
      return posts;
    }
  }

  onThreadFilterChange(): void {
    this.selectedThread = this.postThreadForFilter ? this.postThreadForFilter : undefined;
    this.loadFeed();
  }

  clearThreadFilter(): void {
    this.postThreadForFilter = '';
    this.selectedThread = undefined;
    this.loadFeed();
  }

  selectThread(thread: string) {
    this.postThreadForFilter = thread;
    this.onThreadFilterChange();
  }

  onTagToggleChange(tag: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    if (target.checked) {
      this.hiddenTags = this.hiddenTags.filter(t => t !== tag);
    } else {
      if (!this.hiddenTags.includes(tag)) this.hiddenTags.push(tag);
    }
    this.posts = this.applyFilters(this.allPosts);
  }

  clearTagFilters(): void {
    this.hiddenTags = [];
    this.posts = this.applyFilters(this.allPosts);
  }

  openModal() { this.modalOpen = true; }
  closeModal() { this.modalOpen = false; }

  submitPost() {
    if (!this.postBody.trim() || this.submitting) return;
    this.submitting = true;
    this.postService.createPost({
      title: this.postTitle || undefined,
      message: this.postBody,
      mediaUrl: this.mediaPreviewUrl || undefined,
      linkUrl: this.postLink || undefined,
      thread: this.postThread || undefined,
    }).subscribe({
      next: (res) => {
        try {
          console.log('Post created successfully:', res);
          this.posts.unshift(this.toUiPost(res));
          this.postTitle = '';
          this.postBody = '';
          this.postLink = '';
          this.postThread = '';
          this.mediaPreviewUrl = null;
          this.submitting = false;
          this.closeModal();
        } catch (e) {
          console.error('Error processing created post:', e);
          this.submitting = false;
        }
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.submitting = false;
      }
    });
  }

  onMediaSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.mediaPreviewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeMedia() {
    this.mediaPreviewUrl = null;
    this.fileInput.nativeElement.value = '';
  }

  wrapSelection(before: string, after: string) {
    const ta = this.bodyArea.nativeElement;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = this.postBody.substring(start, end);
    this.postBody =
      this.postBody.substring(0, start) +
      before + selected + after +
      this.postBody.substring(end);
    setTimeout(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = end + before.length;
      ta.focus();
    });
  }

  get previewHtml(): string { return renderMarkdown(this.postBody); }

  private toUiPost(r: PostResponse): Post {
    try {
      let timePosted = '';
      try {
        timePosted = new Date(r.createdAt).toLocaleDateString();
      } catch (e) {
        console.error('Error parsing date:', r.createdAt, e);
        timePosted = r.createdAt; // fallback to raw string
      }

      return {
        postId: r.pid,
        username: r.userName,
        thread: r.thread ?? '#general',
        iconUrl: '',
        timePosted: timePosted,
        title: r.title ?? '',
        message: r.message,
        likeCount: r.likesCount,
        commentCount: r.commentsCount,
        toxicityTags: (r.tagScores || []).map(t => ({ label: t.tag })),
        userVote: null,
      };
    } catch (e) {
      console.error('Error in toUiPost:', r, e);
      // Return a minimal valid post to prevent breaking the whole feed
      return {
        postId: r.pid ?? 'unknown',
        username: r.userName ?? 'unknown',
        thread: '#general',
        iconUrl: '',
        timePosted: 'Unknown',
        title: r.title ?? '',
        message: r.message ?? '',
        likeCount: 0,
        commentCount: 0,
        toxicityTags: [],
        userVote: null,
      };
    }
  }

  trackById(_: number, post: Post) { return post.postId; }
}
