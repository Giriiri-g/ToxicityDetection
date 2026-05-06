import { Routes } from '@angular/router';
import { PostFeedComponent } from './pages/feed/post-feed.example';

export const routes: Routes = [
  {
    path: 'feed',
    component: PostFeedComponent
  },
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full'
  }
];
