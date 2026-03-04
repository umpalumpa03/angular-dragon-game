import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameLoopService } from '../../core/services/game-loop.service';

@Component({
  selector: 'app-game-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-controls.html',
  styleUrl: './game-controls.scss',
})
export class GameControls {
  readonly gameState = inject(GameStateService);
  private readonly gameLoop = inject(GameLoopService);

  onTimerChange(value: number): void {
    this.gameState.setTimerValue(value);
    this.onStartGame();
  }

  onStartGame(): void {
    this.gameState.startGame();
    this.gameLoop.startGameLoop();
  }

  onJump(): void {
    this.gameState.jump();
  }

  onTogglePause(): void {
    this.gameState.togglePause();
  }

  onEndGame(): void {
    this.gameState.endGame();
    this.gameLoop.stopGameLoop();
  }

  onRestart(): void {
    this.onStartGame();
  }
}
