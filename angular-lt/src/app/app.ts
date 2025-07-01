import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StyleService } from './services/style';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [Header, Footer, CommonModule, RouterOutlet],
})
export class AppComponent {
  constructor(private styleService: StyleService) {
    this.styleService.loadAndApplyStyles();
  }
}