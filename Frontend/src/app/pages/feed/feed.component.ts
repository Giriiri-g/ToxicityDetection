import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostCardComponent, ToxicityTag } from './post-card.component';
import { PostService, PostResponse } from '../../services/post.service';

export interface Post {
  id: string;
  thread: string;
  iconUrl: string;
  timePosted: string;
  title: string;
  message: string;
  likeCount: number;
  commentCount: number;
  toxicityScore: number;
  toxicityTags: ToxicityTag[];
  userVote: 'up' | 'down' | null;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit {
  // ── Composer modal state ──────────────────────────────────────────────────
  modalOpen = false;
  postTitle = '';
  postBody = '';
  postLink = '';
  mediaPreviewUrl: string | null = null;
  submitting = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bodyArea') bodyArea!: ElementRef<HTMLTextAreaElement>;

  constructor(private postService: PostService, private router: Router) {}


  ngOnInit() { this.loadFeed(); }

  loadFeed() {
    this.postService.getFeed().subscribe({
      next: res => { this.posts = res.map(this.toUiPost); },
      error: () => {}  // keep demo posts on error
    });
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
    }).subscribe({
      next: (res) => {
        this.posts.unshift(this.toUiPost(res));
        this.postTitle = '';
        this.postBody = '';
        this.postLink = '';
        this.mediaPreviewUrl = null;
        this.submitting = false;
        this.closeModal();
      },
      error: () => { this.submitting = false; }
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

  get previewHtml(): string {
    return this.postBody
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private toUiPost(r: PostResponse): Post {
    return {
      id: r.pid,
      thread: r.userName,
      iconUrl: '',
      timePosted: new Date(r.createdAt).toLocaleDateString(),
      title: r.title ?? '',
      message: r.message,
      likeCount: r.likesCount,
      commentCount: r.commentsCount,
      toxicityScore: Math.round(r.totalToxicityScore),
      toxicityTags: r.tagScores.map(t => ({
        label: t.tag,
        severity: t.score >= 70 ? 'high' : t.score >= 35 ? 'medium' : 'low'
      } as { label: string; severity: 'low' | 'medium' | 'high' })),
      userVote: null,
    };
  }

  trackById(_: number, post: Post) { return post.id; }
  onPostClick(post: Post) {
    this.router.navigate(['/feed', post.id]);
  }

  navItems = [
    { icon: '🏠', label: 'Home' },
    { icon: '🔥', label: 'Popular' },
    { icon: '🌐', label: 'All' },
    { icon: '💬', label: 'Communities' },
    { icon: '⚙️', label: 'Settings' },
  ];

  trending = [
    { rank: 1, thread: '#dev', posts: '12.4k posts today' },
    { rank: 2, thread: '#weekendplans', posts: '8.1k posts today' },
    { rank: 3, thread: '#gaming', posts: '6.7k posts today' },
    { rank: 4, thread: '#foodspots', posts: '5.2k posts today' },
    { rank: 5, thread: '#plans', posts: '3.9k posts today' },
  ];

  posts: Post[] = [
    {
      id: 'demo-1',
      thread: 'r/androidapps',
      iconUrl: '',
      timePosted: '2 days ago',
      title: 'Best App to watch Movies',
      message: 'Hey guys, I have been searching for an app to watch movies on my Android TV. I have tried Net Mirror but it is very slow, so please recommend me an app to watch movies. I want Indian movies as well.',
      likeCount: 32,
      commentCount: 35,
      toxicityScore: 8,
      toxicityTags: [],
      userVote: null,
    },
    {
      id: 'demo-2',
      thread: 'r/worldnews',
      iconUrl: '',
      timePosted: '5 hours ago',
      title: 'Heated debate breaks out over new policy',
      message: 'Users are flooding the thread with strong opinions. Moderation is struggling to keep up with the volume of reports as tensions escalate in the comment section.',
      likeCount: 1241,
      commentCount: 889,
      toxicityScore: 71,
      toxicityTags: [
        { label: 'Hate', severity: 'high' },
        { label: 'NSFW', severity: 'medium' },
      ],
      userVote: 'up',
    },
    {
      id: 'demo-3',
      thread: 'r/learnprogramming',
      iconUrl: '',
      timePosted: '1 hour ago',
      title: 'Why does everyone say Python is slow?',
      message: 'I keep seeing this claim but my scripts run fast enough for everything I need. Is this just for production-scale workloads or is there something I am missing about the benchmarks?',
      likeCount: 147,
      commentCount: 62,
      toxicityScore: 38,
      toxicityTags: [{ label: 'Controversial', severity: 'medium' }],
      userVote: null,
    },
  ];
}
