import { Component, inject } from '@angular/core';
import { GameStateService, DRAGON_X } from '../../core/services/game-state.service';
import { GameLoopService } from '../../core/services/game-loop.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-area.html',
  styleUrl: './game-area.scss',
})
export class GameArea {
  readonly gameState = inject(GameStateService);
  private readonly gameLoop = inject(GameLoopService);
  readonly DRAGON_X = DRAGON_X;

  onRestart(): void {
    this.gameState.resetGameState();
    this.gameState.startGame();
    this.gameLoop.startGameLoop();
  }
}
