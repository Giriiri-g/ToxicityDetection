import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToxicityControlComponent } from './toxicity-control.component';

describe('ToxicityControlComponent', () => {
  let component: ToxicityControlComponent;
  let fixture: ComponentFixture<ToxicityControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToxicityControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToxicityControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
