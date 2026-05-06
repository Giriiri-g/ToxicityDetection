// ─── post-feed.component.ts ──────────────────────────────────────────────────
// Example parent that feeds data into app-post-card via *ngFor
// ─────────────────────────────────────────────────────────────────────────────

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCardComponent, ToxicityTag } from './post-card.component';

export interface Post {
  id: number;
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
  selector: 'app-post-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <section class="feed">
      <app-post-card
        *ngFor="let post of posts; trackBy: trackById"
        [thread]="post.thread"
        [iconUrl]="post.iconUrl"
        [timePosted]="post.timePosted"
        [title]="post.title"
        [message]="post.message"
        [likeCount]="post.likeCount"
        [commentCount]="post.commentCount"
        [toxicityScore]="post.toxicityScore"
        [toxicityTags]="post.toxicityTags"
        [userVote]="post.userVote"
      />
      
    </section>
  `,
  styles: [`
    .feed {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 740px;
      margin: 0 auto;
      padding: 16px;
      background: #0e1113;
      min-height: 100vh;
    }
  `]
})
export class PostFeedComponent {
  trackById(_: number, post: Post) { return post.id; }

  // ── Sample data — replace with API / service call ─────────────────────────
  posts: Post[] = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
