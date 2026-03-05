import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-status',
  imports: [CommonModule],
  templateUrl: './game-status.html',
  styleUrl: './game-status.scss',
})
export class GameStatus {
  public readonly gameState = inject(GameStateService);
}
