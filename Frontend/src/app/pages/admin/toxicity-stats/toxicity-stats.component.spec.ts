import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToxicityStatsComponent } from './toxicity-stats.component';

describe('ToxicityStatsComponent', () => {
  let component: ToxicityStatsComponent;
  let fixture: ComponentFixture<ToxicityStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToxicityStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToxicityStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
