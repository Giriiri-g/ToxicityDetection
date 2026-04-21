import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-face-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-card.component.html',
  styleUrl: './face-card.component.scss'
})
export class FaceCardComponent implements OnInit, OnDestroy {
  stats = [
    { value: 0, target: 24700, label: 'Posts Today', suffix: '' },
    { value: 0, target: 98.4, label: 'Clean Rate', suffix: '%' },
    { value: 0, target: 312, label: 'Content Moderated', suffix: '' },
    { value: 0, target: 5200, label: 'Members Active', suffix: '+' },
  ];

  private animationFrames: number[] = [];
  private intervalId: any;
  @Output() discussionJoined = new EventEmitter<MouseEvent>();
  ngOnInit(): void {
    setTimeout(() => this.animateStats(), 400);
    this.startLiveUpdates();
  }

  JoinTheDiscussion(event: MouseEvent){
    this.discussionJoined.emit(event);
  }

  animateStats(): void {
    this.stats.forEach((stat, i) => {
      const duration = 1800;
      const startTime = performance.now() + i * 120;
      const startValue = 0;
      const endValue = stat.target;

      const animate = (currentTime: number) => {
        if (currentTime < startTime) {
          this.animationFrames[i] = requestAnimationFrame(animate);
          return;
        }
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        stat.value = parseFloat((startValue + (endValue - startValue) * eased).toFixed(stat.suffix === '%' ? 1 : 0));
        if (progress < 1) {
          this.animationFrames[i] = requestAnimationFrame(animate);
        }
      };
      this.animationFrames[i] = requestAnimationFrame(animate);
    });
  }

  startLiveUpdates(): void {
    this.intervalId = setInterval(() => {
      this.stats[0].value += Math.floor(Math.random() * 3);
      this.stats[2].value += Math.random() > 0.7 ? 1 : 0;
      this.stats[3].value += Math.random() > 0.6 ? 1 : 0;
    }, 3000);
  }

  getDisplayValue(stat: any): string {
    if (stat.suffix === '%') return stat.value.toFixed(1) + stat.suffix;
    return stat.value.toLocaleString() + stat.suffix;
  }

  ngOnDestroy(): void {
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
