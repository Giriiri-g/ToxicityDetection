import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService } from '../../services/feed.service';
import { FeedItem } from '../../models/content.model';
import { PostCardComponent } from '../post-card/post-card.component';
import { StoryCardComponent } from '../story-card/story-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent, StoryCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  allItems: FeedItem[] = [];
  postItems: FeedItem[] = [];      // only top-level posts (filtered)
  storyItems: FeedItem[] = [];
  commentMap: Map<string, FeedItem[]> = new Map();
  loading = true;
  activeFilter: 'all' | 'clean' | 'toxic' = 'all';

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.feedService.getFeed().subscribe(items => {
      this.storyItems = items.filter(i => i.type === 'story');

      // Build comment map: postId -> comments[]
      const comments = items.filter(i => i.type === 'comment');
      comments.forEach(c => {
        if (c.parentId) {
          if (!this.commentMap.has(c.parentId)) {
            this.commentMap.set(c.parentId, []);
          }
          this.commentMap.get(c.parentId)!.push(c);
        }
      });

      this.allItems = items.filter(i => i.type === 'post');
      this.applyFilter();
      this.loading = false;
    });
  }

  setFilter(f: 'all' | 'clean' | 'toxic'): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'toxic') {
      this.postItems = this.allItems.filter(i => i.toxicity.detected);
    } else if (this.activeFilter === 'clean') {
      this.postItems = this.allItems.filter(i => !i.toxicity.detected);
    } else {
      this.postItems = [...this.allItems];
    }
  }

  commentsFor(postId: string): FeedItem[] {
    return this.commentMap.get(postId) ?? [];
  }

  get toxicCount(): number {
    return this.allItems.filter(i => i.toxicity.detected).length;
  }

  get totalItems(): number {
    return this.allItems.length;
  }
}
