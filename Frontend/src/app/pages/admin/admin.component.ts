import { Component } from '@angular/core';
import { HeaderComponent } from "../landing/header/header.component";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  imports: [HeaderComponent, RouterOutlet, RouterLink, RouterLinkActive]
})
export class AdminComponent {
  currentView = 'user-stats';
  NavState = false;
  toggleNav(){
    this.NavState = !this.NavState;
  }
}

