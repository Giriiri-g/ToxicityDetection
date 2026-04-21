import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  toxicityThreshold: number;
}

@Component({
  selector: 'app-feed-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() currentUser!: User;
  @Output() logout = new EventEmitter<void>();

  menuItems = [
    { icon: 'home', label: 'Home', route: '/feed', active: true },
    { icon: 'user', label: 'Profile', route: '/profile', active: false },
    { icon: 'bell', label: 'Notifications', route: '/notifications', active: false },
    { icon: 'message', label: 'Messages', route: '/messages', active: false },
    { icon: 'bookmark', label: 'Saved', route: '/saved', active: false },
    { icon: 'settings', label: 'Settings', route: '/settings', active: false }
  ];

  onLogout(): void {
    this.logout.emit();
  }
}
