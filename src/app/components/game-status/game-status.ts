import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-game-status',
  standalone: true,
  imports: [],
  templateUrl: './game-status.html',
  styleUrl: './game-status.scss',
})
export class GameStatus {
  readonly gameState = inject(GameStateService);
}
