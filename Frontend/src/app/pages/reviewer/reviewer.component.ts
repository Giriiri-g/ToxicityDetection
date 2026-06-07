import { Component } from '@angular/core';
import { HeaderComponent } from "../landing/header/header.component";

@Component({
  selector: 'app-reviewer',
  standalone: true,
  templateUrl: './reviewer.component.html',
  styleUrl: './reviewer.component.scss',
  imports: [HeaderComponent]
})
export class ReviewerComponent {}

