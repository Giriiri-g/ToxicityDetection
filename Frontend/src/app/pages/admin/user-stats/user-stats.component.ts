import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface GrowthPoint { month: string; count: number; }
interface UserStats { totalUsers: number; newThisMonth: number; growth: GrowthPoint[]; }

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-stats.component.html',
  styleUrl: './user-stats.component.scss'
})
export class UserStatsComponent implements OnInit {
  stats: UserStats | null = null;
  error = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<UserStats>('https://localhost:5001/api/admin/user-stats', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` })
    }).subscribe({ next: s => this.stats = s, error: () => this.error = 'Failed to load stats.' });
  }

  get maxCount(): number {
    return Math.max(1, ...( this.stats?.growth.map(g => g.count) ?? [1]));
  }
}
