import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'signin',
    loadComponent: () => import('./signin/signin.component').then(m => m.SigninComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },

  {
    path: 'feed',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'feed/p/:postId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/feed/feed-detail.component').then(m => m.FeedDetailComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    children: [
      { path: 'user-stats', loadComponent: () => import('./pages/admin/user-stats/user-stats.component').then(m => m.UserStatsComponent) },
      { path: 'user-control', loadComponent: () => import('./pages/admin/user-control/user-control.component').then(m => m.UserControlComponent) },
      { path: 'toxicity-stats', loadComponent: () => import('./pages/admin/toxicity-stats/toxicity-stats.component').then(m => m.ToxicityStatsComponent) },
      { path: 'toxicity-control', loadComponent: () => import('./pages/admin/toxicity-control/toxicity-control.component').then(m => m.ToxicityControlComponent) },
      { path: 'thread-ranking', loadComponent: () => import('./pages/admin/thread-ranking/thread-ranking.component').then(m => m.ThreadRankingComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'user-stats' }
    ]
  },
  {
    path: 'reviewer',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'Reviewer' },
    loadComponent: () => import('./pages/reviewer/reviewer.component').then(m => m.ReviewerComponent)
  },

  { path: '**', redirectTo: '' },
];
