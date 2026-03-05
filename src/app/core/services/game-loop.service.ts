import { Injectable, inject, OnDestroy } from '@angular/core';
import { GameStateService } from './game-state.service';
import {
  GAME_LOOP_INTERVAL_MS,
  SPAWN_MIN_DELAY_MS,
  SPAWN_RANDOM_DELAY_MS,
} from '../models/game-config';

@Injectable({ providedIn: 'root' })
export class GameLoopService implements OnDestroy {
  private readonly gameState = inject(GameStateService);

  private gameLoopInterval: ReturnType<typeof setInterval> | null = null;
  private spawnTimeout: ReturnType<typeof setTimeout> | null = null;

  public startGameLoop(): void {
    this.stopGameLoop();

    this.gameLoopInterval = setInterval(() => {
      if (this.gameState.isActive()) {
        this.tick();
      }
    }, GAME_LOOP_INTERVAL_MS);

    this.scheduleNextSpawn();
  }

  public stopGameLoop(): void {
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }

    if (this.spawnTimeout !== null) {
      clearTimeout(this.spawnTimeout);
      this.spawnTimeout = null;
    }
  }

  public ngOnDestroy(): void {
    this.stopGameLoop();
  }

  private tick(): void {
    this.gameState.moveObstacles();
    this.gameState.checkCollisions();
    this.gameState.updateScore();
    this.gameState.updateTimer();
  }

  private scheduleNextSpawn(): void {
    const delay =
      SPAWN_MIN_DELAY_MS + Math.random() * SPAWN_RANDOM_DELAY_MS;

    this.spawnTimeout = setTimeout(() => {
      if (this.gameState.isActive()) {
        this.gameState.spawnObstacle();
      }

      if (this.gameState.isRunning()) {
        this.scheduleNextSpawn();
      }
    }, delay);
  }
}