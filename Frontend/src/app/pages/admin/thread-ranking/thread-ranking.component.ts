import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface ThreadRank { thread: string; postCount: number; trend: { label: string; newPosts: number; flaggedPosts: number }[] }

@Component({
  selector: 'app-thread-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread-ranking.component.html',
  styleUrl: './thread-ranking.component.scss'
})
export class ThreadRankingComponent implements OnInit {
  threads: ThreadRank[] | null = null;

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void { this.load(); }

  async load() {
    try {
      const r: any = await this.http.get('https://localhost:5001/api/admin/threads', {
        headers: { Authorization: `Bearer ${this.auth.getToken()}` }
      }).toPromise();
      this.threads = (r || []).map((x: any) => ({ thread: x.thread ?? x.Thread, postCount: x.postCount ?? x.PostCount, trend: x.trend ?? x.Trend }));
    } catch (e) { console.error(e); }
  }
}
