import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadRankingComponent } from './thread-ranking.component';

describe('ThreadRankingComponent', () => {
  let component: ThreadRankingComponent;
  let fixture: ComponentFixture<ThreadRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadRankingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
