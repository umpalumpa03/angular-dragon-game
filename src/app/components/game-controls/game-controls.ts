import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../core/services/game-state.service';
import { GameLoopService } from '../../core/services/game-loop.service';
import {
  DEFAULT_TIMER_SECONDS,
  MAX_TIMER_SECONDS,
  MIN_TIMER_SECONDS,
} from '../../core/models/game-config';

@Component({
  selector: 'app-game-controls',
  imports: [CommonModule, FormsModule],
  templateUrl: './game-controls.html',
  styleUrl: './game-controls.scss',
})
export class GameControls {
  public readonly gameState = inject(GameStateService);
  private readonly gameLoop = inject(GameLoopService);

  public readonly minTimer = MIN_TIMER_SECONDS;
  public readonly maxTimer = MAX_TIMER_SECONDS;
  public readonly defaultTimer = DEFAULT_TIMER_SECONDS;

  public onTimerChange(value: number): void {
    const clamped = Math.min(
      this.maxTimer,
      Math.max(this.minTimer, Number(value) || DEFAULT_TIMER_SECONDS),
    );
    this.gameState.setTimerValue(clamped);
  }

  public onStartGame(): void {
    this.gameState.startGame();
    this.gameLoop.startGameLoop();
  }

  public onJump(): void {
    this.gameState.jump();
  }

  public onTogglePause(): void {
    this.gameState.togglePause();
  }

  public onEndGame(): void {
    this.gameState.endGame();
    this.gameLoop.stopGameLoop();
  }

  public onRestart(): void {
    this.onStartGame();
  }
}