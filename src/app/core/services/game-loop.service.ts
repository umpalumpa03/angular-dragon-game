import { Injectable, OnDestroy } from '@angular/core';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root',
})
export class GameLoopService implements OnDestroy {
  private gameLoopInterval: any = null;
  private spawnInterval: any = null;

  constructor(private gameState: GameStateService) {}

  startGameLoop(): void {
    this.cleanupIntervals();

    this.gameLoopInterval = setInterval(() => {
      if (this.gameState.isRunning() && !this.gameState.isPaused()) {
        this.updateGameState();
      }
    }, 16);

    this.startSpawning();
  }

  private startSpawning(): void {
    const spawnObstacle = () => {
      if (this.gameState.isRunning() && !this.gameState.isPaused()) {
        this.gameState.spawnObstacle();
      }

      this.spawnInterval = setTimeout(spawnObstacle, 2000 + Math.random() * 1000);
    };

    spawnObstacle();
  }

  private updateGameState(): void {
    this.gameState.moveObstacles();
    this.gameState.checkCollisions();
    this.gameState.updateScore();
    this.gameState.updateTimer();
    this.gameState.updateSpeed();
  }

  stopGameLoop(): void {
    this.cleanupIntervals();
  }

  cleanupIntervals(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.cleanupIntervals();
  }
}
