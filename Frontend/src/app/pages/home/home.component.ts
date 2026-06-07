import { Component } from '@angular/core';
import { HeaderComponent } from '../landing/header/header.component';
import { FaceCardComponent } from '../landing/body/face-card/face-card.component';
import { AboutComponent } from '../landing/body/about/about.component';
import { FeaturesComponent } from '../landing/body/features/features.component';
import { ServicesComponent } from '../landing/body/services/services.component';
import { FooterComponent } from '../landing/footer/footer.component';

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

