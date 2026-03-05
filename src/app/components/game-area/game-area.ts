import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { GameLoopService } from '../../core/services/game-loop.service';
import { DRAGON_X } from '../../core/models/game-config';

@Component({
  selector: 'app-game-area',
  imports: [CommonModule],
  templateUrl: './game-area.html',
  styleUrl: './game-area.scss',
})
export class GameArea {
  public readonly gameState = inject(GameStateService);
  private readonly gameLoop = inject(GameLoopService);

  public readonly DRAGON_X = DRAGON_X;

  public onRestart(): void {
    this.gameState.startGame();
    this.gameLoop.startGameLoop();
  }
}