import { Component, OnInit, inject } from '@angular/core';
import { PostService, PostResponse } from '../../services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PostCardComponent, ToxicityTag  } from './post-card.component';
import { CommonModule, Location } from '@angular/common';


export interface FlatComment {
  post: PostResponse;
  depth: number;
}

@Component({
  selector: 'app-feed-detail',
  standalone: true,
  imports: [PostCardComponent, CommonModule],
  templateUrl: './feed-detail.component.html',
  styleUrls: ['./feed-detail.component.scss']
})
export class FeedDetailComponent implements OnInit {
  private router = inject(Router);
  postId = '';
  post$: Observable<PostResponse> | undefined;
  flatComments: FlatComment[] = [];

  constructor(
    private postService: PostService,
    private route: ActivatedRoute
  ) {}

  buildFlatComments(comments: PostResponse[]): FlatComment[] {
    if (!comments?.length) return [];

    // Backend returns comments as a flattened list.
    // Top-level comments for this post are expected to have PPID === this.postId.
    const rootParentId = this.postId;
    
    // Group by parent id (PPID). Runtime payload uses lowercase `ppid`.
    const byParent = new Map<string, PostResponse[]>();
    for (const c of comments) {
      const key = c.ppid ?? '__null__';
      const arr = byParent.get(key) ?? [];
      arr.push(c);
      byParent.set(key, arr);
    }

    // Sort each sibling group by createdAt ascending
    for (const [, siblings] of byParent) {
      siblings.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    const result: FlatComment[] = [];
    const visited = new Set<string>();

    // DFS: parent first, then children immediately after (pre-order)
    const walk = (parentId: string, depth: number) => {
      const children = byParent.get(parentId) ?? [];
      for (const c of children) {

        // Guard against accidental cycles / malformed data
        if (visited.has(c.pid)) continue;
        visited.add(c.pid);

        result.push({ post: c, depth });

        // Frontend should use the child's PID as the next parent key,
        // because backend sets PPID of a reply to the parent's PID.
        walk(c.pid, depth + 1);
      }
    };

    walk(rootParentId, 1);

    // Safety: if we ended up with no nodes but backend returned comments,
    // log diagnostic info to quickly spot mismatched PPID/PID wiring.
    if (result.length === 0 && comments.length > 0) {
      console.warn('buildFlatComments produced 0 nodes.', {
        postId: this.postId,
        rootParentId,
        sample: comments.slice(0, 5).map(c => ({ pid: c.pid, ppid: c.ppid }))
      });
    }

    return result;
  }

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('postId') ?? '';
    if (this.postId) {
      this.post$ = this.postService.getPostById(this.postId);
      this.loadComments();
    }
  }

  loadComments(): void {
    this.postService.getCommentsForPost(this.postId).subscribe({
      next: comments => {
        this.flatComments = this.buildFlatComments(comments);
      },
      error: err => console.error('Error loading comments:', err)
    });
  }

  goBack(): void { this.router.navigate(['/feed']); }

  refreshComments(): void { this.loadComments(); }

  toToxicityTags(tagScores: { tag: string }[] | undefined): ToxicityTag[] { return (tagScores || []).map(t => ({ label: t.tag })); }
}