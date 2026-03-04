import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameArea } from './components/game-area/game-area';
import { GameControls } from './components/game-controls/game-controls';
import { GameHeader } from './components/game-header/game-header';
import { GameStatus } from './components/game-status/game-status';
import { GameInstructions } from './components/game-instructions/game-instructions';
import { GameStateService } from './core/services/game-state.service';
import { GameLoopService } from './core/services/game-loop.service';

@Component({
  selector: 'app-root',
  imports: [GameArea, GameControls, GameHeader, GameStatus, GameInstructions],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  private readonly gameState = inject(GameStateService);
  private readonly gameLoop = inject(GameLoopService);

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      if (!this.gameState.isRunning()) {
        this.startGame();
      } else if (!this.gameState.isPaused()) {
        this.gameState.jump();
      }
    } else if (event.code === 'KeyP') {
      event.preventDefault();
      if (this.gameState.isRunning()) {
        this.gameState.togglePause();
      }
    } else if (event.code === 'KeyR') {
      event.preventDefault();
      this.startGame();
    }
  }

  private startGame(): void {
    this.gameState.startGame();
    this.gameLoop.startGameLoop();
  }

  ngOnDestroy(): void {
    this.gameLoop.stopGameLoop();
  }
}
