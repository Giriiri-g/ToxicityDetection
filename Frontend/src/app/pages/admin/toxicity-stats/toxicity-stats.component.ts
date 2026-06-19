import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface TagStat { tag: string; count: number }
interface TrendPoint { label: string; newPosts: number; flaggedPosts: number }
interface ToxicityStats {
  totalPosts: number;
  flaggedPosts: number;
  tagCounts: { tag: string; count: number }[];
  trend: { label: string; newPosts: number; flaggedPosts: number }[];
}

@Component({
  selector: 'app-toxicity-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toxicity-stats.component.html',
  styleUrl: './toxicity-stats.component.scss'
})
export class ToxicityStatsComponent implements OnInit {
  stats: ToxicityStats | null = null;
  labels: string[] = [];
  viewBox = '0 0 100 40';
  pathTotal = '';
  pathFlagged = '';
  points: { x: number; yTotal: number; yFlagged: number }[] = [];

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void {
    this.load();
  }

  async load() {
    try {
      const s: any = await this.http.get('https://localhost:5001/api/admin/toxicity-stats', {
        headers: { Authorization: `Bearer ${this.auth.getToken()}` }
      }).toPromise();
      // normalize PascalCase -> camelCase keys
      const map = (k: string, alt?: string) => s[k] ?? s[alt ?? k];
      const trend = map('Trend', 'trend') || [];
      this.stats = {
        totalPosts: map('TotalPosts', 'totalPosts') || 0,
        flaggedPosts: map('FlaggedPosts', 'flaggedPosts') || 0,
        tagCounts: (map('TagCounts', 'tagCounts') || []).map((t: any) => ({ tag: t.tag ?? t.Tag, count: t.count ?? t.Count })),
        trend: trend.map((t: any) => ({ label: t.label ?? t.Label, newPosts: t.newPosts ?? t.NewPosts, flaggedPosts: t.flaggedPosts ?? t.FlaggedPosts }))
      };
      this.buildChart();
    } catch (e) { console.error(e); }
  }

  buildChart() {
    if (!this.stats) return;
    const w = 100; const h = 30; // viewbox inner
    const trend = this.stats.trend;
    // Format label as MM-dd to save space
    this.labels = trend.map(t => {
      const [year, month, day] = t.label.split('-');
      return `${month}-${day}`;
    });

    const totalData = trend.map(t => t.newPosts);
    const flaggedData = trend.map(t => t.flaggedPosts);
    const max = Math.max(...totalData.concat(flaggedData, [1]));

    const stepX = w / Math.max(1, trend.length - 1);
    this.points = trend.map((t, i) => {
      const x = i * stepX;
      const yTotal = h - (t.newPosts / max) * h;
      const yFlagged = h - (t.flaggedPosts / max) * h;
      return { x, yTotal, yFlagged };
    });

    const buildPath = (arrKey: 'yTotal' | 'yFlagged') => {
      if (this.points.length === 0) return '';
      return this.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p[arrKey]}`).join(' ');
    };

    this.pathTotal = buildPath('yTotal');
    this.pathFlagged = buildPath('yFlagged');
    this.viewBox = `0 0 ${w} ${h}`;
  }

}
