import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { GameArea } from './components/game-area/game-area';
import { GameControls } from './components/game-controls/game-controls';
import { GameHeader } from './components/game-header/game-header';
import { GameStatus } from './components/game-status/game-status';
import { GameInstructions } from './components/game-instructions/game-instructions';
import { GameStateService } from './core/services/game-state.service';
import { GameLoopService } from './core/services/game-loop.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameArea, GameControls, GameHeader, GameStatus, GameInstructions],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  private readonly gameState = inject(GameStateService);
  private readonly gameLoop = inject(GameLoopService);

  @HostListener('window:keydown', ['$event'])
  public handleKeydown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'Space':
      case 'ArrowUp':
        event.preventDefault();
        if (!this.gameState.isRunning()) {
          this.startGame();
        } else if (this.gameState.canJump()) {
          this.gameState.jump();
        }
        break;

      case 'KeyP':
        event.preventDefault();
        if (this.gameState.canPause()) {
          this.gameState.togglePause();
        }
        break;

      case 'KeyR':
        event.preventDefault();
        this.startGame();
        break;
    }
  }

  public ngOnDestroy(): void {
    this.gameLoop.stopGameLoop();
  }

  private startGame(): void {
    this.gameState.startGame();
    this.gameLoop.startGameLoop();
  }
}