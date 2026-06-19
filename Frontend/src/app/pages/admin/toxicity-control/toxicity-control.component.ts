import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

interface Thresholds {
  tagThresholds: { [key: string]: number };
  blurThreshold: number;
  blockThreshold: number;
}

@Component({
  selector: 'app-toxicity-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toxicity-control.component.html',
  styleUrl: './toxicity-control.component.scss'
})
export class ToxicityControlComponent implements OnInit {

  thresholds: Thresholds | null = null;
  tagKeys: string[] = [];

  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit(): void { this.load(); }

  async load() {
    try {
      const t: any = await this.http.get('https://localhost:5001/api/admin/thresholds', {
        headers: { Authorization: `Bearer ${this.auth.getToken()}` }
      }).toPromise();
      const tagThresholds = t.TagThresholds ?? t.tagThresholds ?? {};
      const blur = t.BlurThreshold ?? t.blurThreshold ?? 35;
      const block = t.BlockThreshold ?? t.blockThreshold ?? 70;

      this.thresholds = { tagThresholds, blurThreshold: blur, blockThreshold: block };
      this.tagKeys = Object.keys(this.thresholds.tagThresholds).sort();
    } catch (e) { console.error(e); }
  }

  async save() {
    if (!this.thresholds) return;
    try {
      const payload = {
        TagThresholds: this.thresholds.tagThresholds,
        BlurThreshold: this.thresholds.blurThreshold,
        BlockThreshold: this.thresholds.blockThreshold
      };
      await this.http.post('https://localhost:5001/api/admin/thresholds', payload, {
        headers: { Authorization: `Bearer ${this.auth.getToken()}` }
      }).toPromise();
      alert('Thresholds saved');
    } catch (e) { console.error(e); alert('Save failed'); }
  }

}
