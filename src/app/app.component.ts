import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent } from "../components/angular-phaser-game";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'phaser-square-game';
}
