import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-header.html',
  styleUrl: './game-header.scss',
})
export class GameHeader {
  readonly gameState = inject(GameStateService);
}
