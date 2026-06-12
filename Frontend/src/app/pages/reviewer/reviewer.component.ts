import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../landing/header/header.component';
import {
  ReviewerService,
  ReviewPostResponse,
  ReviewPostDetailResponse,
} from '../../services/reviewer.service';

export interface ReviewTag { label: string; severity: 'low' | 'medium' | 'high'; }

export interface ReviewPost {
  id: string;
  username: string;
  timePosted: string;
  title: string;
  message: string;
  toxicityScore: number;
  tags: ReviewTag[];
  // detail fields
  userJoined: string;
  history: { title: string; toxicityScore: number; timePosted: string }[];
}

@Component({
  selector: 'app-reviewer',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './reviewer.component.html',
  styleUrl: './reviewer.component.scss',
})
export class ReviewerComponent implements OnInit {

  constructor(private reviewerService: ReviewerService) {}

  // ── State ──────────────────────────────────────────────────────────────────
  posts: ReviewPost[] = [];
  loading = false;
  error: string | null = null;

  // Server-side pagination totals
  totalCount = 0;

  // ── Nav ───────────────────────────────────────────────────────────────────
  navOpen = false;
  toggleNav() { this.navOpen = !this.navOpen; }

  // ── Filters ───────────────────────────────────────────────────────────────
  sortOrder: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';
  minScore = 0;
  selectedTag = '';

  readonly allTags = ['Hate', 'Threat', 'NSFW', 'Spam', 'Controversial'];

  // ── Pagination ────────────────────────────────────────────────────────────
  readonly pageSize = 10;
  currentPage = 1;

  get filteredPosts(): ReviewPost[] {
    let list = this.posts
      .filter(p => p.toxicityScore >= this.minScore)
      .filter(p => !this.selectedTag || p.tags.some(t => t.label === this.selectedTag));

    list = list.sort((a, b) => {
      if (this.sortOrder === 'newest') return new Date(b.timePosted).getTime() - new Date(a.timePosted).getTime();
      if (this.sortOrder === 'oldest') return new Date(a.timePosted).getTime() - new Date(b.timePosted).getTime();
      if (this.sortOrder === 'highest') return b.toxicityScore - a.toxicityScore;
      return a.toxicityScore - b.toxicityScore;
    });

    return list;
  }

  get pagedPosts(): ReviewPost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPosts.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onFilterChange() { this.currentPage = 1; }

  // ── Data loading ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;
    // Load all flagged posts up-front for client-side filter/sort (pageSize 50 max per call)
    this.reviewerService.getFlaggedPosts(1, 50).subscribe({
      next: (res) => {
        this.posts = res.posts.map(this.mapPost);
        this.totalCount = res.total;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load flagged posts.';
        this.loading = false;
      }
    });
  }

  private mapPost(p: ReviewPostResponse): ReviewPost {
    return {
      id: p.pid,
      username: p.userName,
      timePosted: p.createdAt,
      title: p.title ?? '(no title)',
      message: p.message,
      toxicityScore: Math.round(p.totalToxicityScore),
      tags: p.tagScores.map(t => ({
        label: t.tag,
        severity: t.score >= 70 ? 'high' : t.score >= 35 ? 'medium' : 'low'
      })),
      userJoined: '',
      history: [],
    };
  }

  // ── Aside / detail panel ──────────────────────────────────────────────────
  selectedPost: ReviewPost | null = null;
  detailLoading = false;
  historyOpen = false;
  feedback = '';
  editTags: ReviewTag[] = [];

  openPost(post: ReviewPost) {
    this.selectedPost = { ...post };
    this.historyOpen = false;
    this.feedback = '';
    this.editTags = post.tags.map(t => ({ ...t }));
    this.detailLoading = true;

    this.reviewerService.getPostDetail(post.id).subscribe({
      next: (detail: ReviewPostDetailResponse) => {
        this.selectedPost!.userJoined = detail.userJoined;
        this.selectedPost!.history = detail.history.map(h => ({
          title: h.title ?? '(no title)',
          toxicityScore: Math.round(h.totalToxicityScore),
          timePosted: h.createdAt,
        }));
        this.detailLoading = false;
      },
      error: () => { this.detailLoading = false; }
    });
  }

  closePost() { this.selectedPost = null; }

  approve(clearScores: boolean) {
    if (!this.selectedPost) return;
    const id = this.selectedPost.id;
    this.reviewerService.reviewPost(id, {
      approve: true,
      clearScores,
      editedTags: clearScores ? null : this.editTags.map(t => t.label),
      feedback: this.feedback || null,
    }).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.closePost();
      },
      error: () => alert('Review action failed.')
    });
  }

  reject() {
    if (!this.selectedPost) return;
    const id = this.selectedPost.id;
    this.reviewerService.reviewPost(id, {
      approve: false,
      clearScores: false,
      editedTags: null,
      feedback: this.feedback || null,
    }).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.closePost();
      },
      error: () => alert('Review action failed.')
    });
  }

  removeTag(tag: ReviewTag) {
    this.editTags = this.editTags.filter(t => t.label !== tag.label);
  }

  tagColor(severity: string) {
    return severity === 'high' ? '#ff4500' : severity === 'medium' ? '#fbbf24' : '#94e044';
  }

  tagBg(severity: string) {
    return severity === 'high' ? 'rgba(239,68,68,.15)' : severity === 'medium' ? 'rgba(245,158,11,.15)' : 'rgba(34,197,94,.12)';
  }

  scoreBarColor(score: number) {
    return score >= 70 ? '#ef4444' : score >= 35 ? '#f59e0b' : '#22c55e';
  }
}
