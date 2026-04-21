import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() signinclick = new EventEmitter<MouseEvent>();
  OnSignin(event: MouseEvent) {
    this.signinclick.emit(event);}
}
