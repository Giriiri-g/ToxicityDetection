import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './pages/landing/header/header.component';
import { FooterComponent } from './pages/landing/footer/footer.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FaceCardComponent } from "./pages/landing/body/face-card/face-card.component";
import { AboutComponent } from "./pages/landing/body/about/about.component";
import { FeaturesComponent } from "./pages/landing/body/features/features.component";
import { ServicesComponent } from "./pages/landing/body/services/services.component";
import { SigninComponent } from "./pages/landing/signin/signin.component";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SignupComponent } from "./pages/landing/signup/signup.component";
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { PostFeedComponent } from './pages/feed/post-feed.example';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterOutlet, FaceCardComponent, AboutComponent, FeaturesComponent, ServicesComponent, SigninComponent, SignupComponent, PostFeedComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0, display: 'none' })), // "None" state
      state('*', style({ opacity: 1, display: 'block' })),    // "Block" state
      transition(':enter', [
        style({ display: 'block', opacity: 0 }),
        animate('0.8s ease-in')
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  signin = false;
  signup = false;
  isLandingPage = true;
  @ViewChild('signinComponent', { read: ElementRef })
  signinComponent!: ElementRef;

  @ViewChild('signupComponent', { read: ElementRef })
  signupComponent!: ElementRef;

  ngOnInit(): void {
    this.http.get('https://localhost:5001/api/posts/feed?k=1').subscribe({
      next: response => console.log('API is working:', response),
      error: error => console.error('API test failed:', error),
      complete: () => console.log('API test completed')
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const navEvent = event as NavigationEnd;
        this.isLandingPage = navEvent.url === '/' || navEvent.url === '';
      });
  }

  ToggleSignin(event: MouseEvent) {
    event.stopPropagation();
    this.signin = !this.signin;
  }

  ToggleSignup(event: MouseEvent) {
    event.stopPropagation();
    this.signup = !this.signup;
    this.signin = false;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.signin && this.signinComponent && !this.signinComponent.nativeElement.contains(event.target)) {
      this.signin = false;
    }
    // else if (this.signup && this.signupComponent && !this.signupComponent.nativeElement.contains(event.target)) {
    //   this.signup = false;
    // }
  }
}
