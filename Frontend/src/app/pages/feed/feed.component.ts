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
      comments: [
        {
          id: 'c1',
          author: {
            id: '3',
            username: 'mikejohnson',
            displayName: 'Mike Johnson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
            toxicityThreshold: 60
          },
          content: 'Looks amazing! Which park did you visit?',
          toxicityScore: 0,
          createdAt: new Date(Date.now() - 3000000),
          likesCount: 3,
          isLiked: false,
          replies: [
            {
              id: 'c1r1',
              author: {
                id: '2',
                username: 'sarahsmith',
                displayName: 'Sarah Smith',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                toxicityThreshold: 40
              },
              content: 'Central Park! It was lovely this time of year.',
              toxicityScore: 0,
              createdAt: new Date(Date.now() - 2800000),
              likesCount: 2,
              isLiked: true,
              replies: []
            }
          ]
        }
      ]
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
      content: 'This new policy is absolutely ridiculous. Who came up with this garbage? Complete waste of time and resources. Some people just dont think before acting.',
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
      content: 'Some people are just so ignorant it makes my blood boil. How can you be so clueless about basic facts? Do some research before spewing nonsense everywhere.',
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

  stories = [
    { id: '1', author: 'Your Story', avatar: this.currentUser.avatarUrl, isUser: true, hasStory: false },
    { id: '2', author: 'Sarah Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', isUser: false, hasStory: true },
    { id: '3', author: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', isUser: false, hasStory: true },
    { id: '4', author: 'Emma Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', isUser: false, hasStory: true },
    { id: '5', author: 'Alex Thompson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', isUser: false, hasStory: true },
    { id: '6', author: 'Lisa Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', isUser: false, hasStory: true }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Filter posts based on user's toxicity threshold
    this.posts = this.posts.filter(post => post.toxicityScore <= this.currentUser.toxicityThreshold);
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
      toxicityScore: Math.floor(Math.random() * 20), // Simulated
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

    // Simulate API call
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
