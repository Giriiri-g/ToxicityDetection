import { Component } from '@angular/core';
import { HeaderComponent } from '../pages/landing/header/header.component';
import { FaceCardComponent } from '../pages/landing/body/face-card/face-card.component';
import { AboutComponent } from '../pages/landing/body/about/about.component';
import { FeaturesComponent } from '../pages/landing/body/features/features.component';
import { ServicesComponent } from '../pages/landing/body/services/services.component';
import { FooterComponent } from '../pages/landing/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    FaceCardComponent,
    AboutComponent,
    FeaturesComponent,
    ServicesComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}

