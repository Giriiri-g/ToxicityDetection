import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostCardComponent, Post, User, Comment } from './components/post-card/post-card.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PostCardComponent, SidebarComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  currentUser: User = {
    id: '1',
    username: 'johndoe',
    displayName: 'John Doe',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    toxicityThreshold: 50
  };

  newPostContent = '';
  showCreatePost = false;
  isSubmitting = false;
  sidebarCollapsed = false;
  selectedSort = 'hot';
  selectedToxicityFilter: 'all' | 'safe' | 'mild' | 'mature' | 'toxic' = 'all';

  posts: Post[] = [
    {
      id: '1',
      author: {
        id: '2',
        username: 'sarahsmith',
        displayName: 'Sarah Smith',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        toxicityThreshold: 40
      },
      content: 'Just had an amazing day at the park! The weather was perfect and I met some wonderful people. Hope everyone is having a great day too! 🌞',
      toxicityScore: 5,
      category: 'Safe',
      createdAt: new Date(Date.now() - 3600000),
      likesCount: 24,
      commentsCount: 5,
      sharesCount: 2,
      isLiked: false,
      comments: []
    },
    {
      id: '2',
      author: {
        id: '3',
        username: 'mikejohnson',
        displayName: 'Mike Johnson',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        toxicityThreshold: 60
      },
      content: 'This new policy is absolutely ridiculous. Who came up with this garbage? Complete waste of time and resources.',
      toxicityScore: 65,
      category: 'Mild',
      createdAt: new Date(Date.now() - 7200000),
      likesCount: 12,
      commentsCount: 18,
      sharesCount: 4,
      isLiked: true,
      comments: []
    },
    {
      id: '3',
      author: {
        id: '4',
        username: 'emmawilson',
        displayName: 'Emma Wilson',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        toxicityThreshold: 30
      },
      content: 'Check out this beautiful sunset from my vacation! Nature never fails to amaze me. 🌅',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      toxicityScore: 0,
      category: 'Safe',
      createdAt: new Date(Date.now() - 10800000),
      likesCount: 156,
      commentsCount: 23,
      sharesCount: 12,
      isLiked: false,
      comments: []
    },
    {
      id: '4',
      author: {
        id: '5',
        username: 'alexthompson',
        displayName: 'Alex Thompson',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        toxicityThreshold: 70
      },
      content: 'Some people are just so ignorant it makes my blood boil. How can you be so clueless about basic facts?',
      toxicityScore: 78,
      category: 'Mature',
      createdAt: new Date(Date.now() - 14400000),
      likesCount: 3,
      commentsCount: 45,
      sharesCount: 1,
      isLiked: false,
      comments: []
    }
  ];

  trendingTopics = [
    { tag: '#AIethics', posts: '12.5k' },
    { tag: '#CleanTech', posts: '8.2k' },
    { tag: '#MentalHealth', posts: '5.1k' },
    { tag: '#SustainableLiving', posts: '3.8k' },
    { tag: '#WorkLifeBalance', posts: '2.9k' },
    { tag: '#DigitalPrivacy', posts: '2.3k' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filterPosts();
  }

  get filteredPosts(): Post[] {
    let posts = this.posts.filter(post => post.toxicityScore <= this.currentUser.toxicityThreshold);

    if (this.selectedToxicityFilter !== 'all') {
      const filterMap: { [key: string]: [number, number] } = {
        safe: [0, 25],
        mild: [26, 50],
        mature: [51, 75],
        toxic: [76, 100]
      };
      const [min, max] = filterMap[this.selectedToxicityFilter];
      posts = posts.filter(post => post.toxicityScore >= min && post.toxicityScore <= max);
    }

    // Sort based on selected option
    switch (this.selectedSort) {
      case 'hot':
        posts.sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount));
        break;
      case 'new':
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'top':
        posts.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'toxicity-low':
        posts.sort((a, b) => a.toxicityScore - b.toxicityScore);
        break;
      case 'toxicity-high':
        posts.sort((a, b) => b.toxicityScore - a.toxicityScore);
        break;
    }
    return posts;
  }

  filterPosts(): void {
    // Triggered by filter changes
  }

  onSortChange(sort: string): void {
    this.selectedSort = sort;
  }

  onToxicityFilterChange(filter: 'all' | 'safe' | 'mild' | 'mature' | 'toxic'): void {
    this.selectedToxicityFilter = filter;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onLikeToggle(post: Post): void {
    post.isLiked = !post.isLiked;
    post.likesCount += post.isLiked ? 1 : -1;
  }

  onCommentAdded(event: { post: Post; comment: string }): void {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: this.currentUser,
      content: event.comment,
      toxicityScore: Math.floor(Math.random() * 20),
      createdAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: []
    };

    if (!event.post.comments) {
      event.post.comments = [];
    }
    event.post.comments.push(newComment);
    event.post.commentsCount++;
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;

    this.isSubmitting = true;
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        author: this.currentUser,
        content: this.newPostContent,
        toxicityScore: Math.floor(Math.random() * 30),
        category: 'Safe',
        createdAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        comments: []
      };

      this.posts.unshift(newPost);
      this.newPostContent = '';
      this.showCreatePost = false;
      this.isSubmitting = false;
    }, 1000);
  }

  logout(): void {
    this.router.navigate(['/']);
  }
}
