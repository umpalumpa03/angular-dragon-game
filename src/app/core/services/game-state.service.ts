import { Injectable, signal, computed, effect } from '@angular/core';
import { IObstacle } from '../models/obstacles.model';

export const GROUND_LEVEL = 50;
export const DRAGON_X = 30;

export type DragonState = 'running' | 'jumping' | 'falling';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  readonly isRunning = signal(false);
  readonly isPaused = signal(true);
  readonly isGameOver = signal(false);

  readonly timeRemaining = signal(0);
  readonly timeSurvived = signal(0);
  readonly timerInputValue = signal(60);

  readonly score = signal(0);
  readonly highScore = signal(0);
  readonly speed = signal(1);

  readonly dragonY = signal(GROUND_LEVEL);
  readonly dragonVelocity = signal(0);
  readonly dragonState = signal<DragonState>('running');

  readonly obstacles = signal<IObstacle[]>([]);

  readonly gameStatus = computed(() => (this.isRunning() ? 'RUNNING' : 'STOPPED'));

  readonly canJump = computed(
    () => this.isRunning() && !this.isPaused() && this.dragonState() === 'running',
  );

  readonly canPause = computed(() => this.isRunning());

  readonly canEndGame = computed(() => this.isRunning());

  constructor() {
    effect(() => {
      const currentScore = this.score();
      const currentHigh = this.highScore();
      if (currentScore > currentHigh) {
        this.highScore.set(currentScore);
      }
    });

    effect(() => {
      if (this.timeRemaining() <= 0 && this.isRunning()) {
        this.endGame();
      }
    });
  }

  startGame(): void {
    this.obstacles.set([]);
    this.isRunning.set(true);
    this.isPaused.set(false);
    this.isGameOver.set(false);

    this.timeRemaining.set(this.timerInputValue());
    this.timeSurvived.set(0);
    this.score.set(0);
    this.speed.set(1);

    this.dragonState.set('running');
    this.dragonY.set(GROUND_LEVEL);
    this.dragonVelocity.set(0);
  }

  resetGameState(): void {
    this.isRunning.set(false);
    this.isPaused.set(true);
    this.isGameOver.set(false);
    this.timeRemaining.set(0);
    this.timeSurvived.set(0);
    this.speed.set(1);
    this.score.set(0);
    this.dragonY.set(GROUND_LEVEL);
    this.dragonVelocity.set(0);
    this.dragonState.set('running');
    this.obstacles.set([]);
  }

  endGame(): void {
    this.highScore.update((prev) => Math.max(prev, this.score()));
    this.isRunning.set(false);
    this.isPaused.set(true);
    this.isGameOver.set(true);
  }

  togglePause(): void {
    this.isPaused.update((v) => !v);
  }

  setTimerValue(value: number): void {
    this.timerInputValue.set(value);
  }

  jump(): void {
    if (this.dragonState() !== 'running') {
      return;
    }

    this.dragonState.set('jumping');
    this.dragonY.set(GROUND_LEVEL + 50);

    setTimeout(() => {
      if (this.dragonState() === 'jumping') {
        this.dragonY.set(GROUND_LEVEL);
        this.dragonState.set('running');
      }
    }, 500);
  }

  spawnObstacle(): void {
    const newObstacle: IObstacle = {
      x: 100,
      width: 10,
      height: 20,
    };
    this.obstacles.update((obstacles) => [...obstacles, newObstacle]);
  }

  moveObstacles(): void {
    this.obstacles.update((obstacles) =>
      obstacles
        .map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - this.speed(),
        }))
        .filter((obstacle) => obstacle.x > -obstacle.width),
    );
  }

  checkCollisions(): boolean {
    const obstacles = this.obstacles();
    const dragonBottom = this.dragonY();
    const dragonHeight = 40;
    const dragonTop = dragonBottom + dragonHeight;
    const dragonLeft = DRAGON_X - 41;
    const dragonRight = DRAGON_X - 21;

    for (const obstacle of obstacles) {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleBottom = 40;
      const obstacleTop = obstacleBottom + obstacle.height;

      const horizontalOverlap = obstacleLeft < dragonRight && obstacleRight > dragonLeft;
      const verticalOverlap = dragonBottom < obstacleTop && dragonTop > obstacleBottom;

      if (horizontalOverlap && verticalOverlap) {
        this.endGame();
        return true;
      }
    }
    return false;
  }

  updateScore(): void {
    if (this.isRunning() && !this.isPaused()) {
      this.score.update((score) => score + 1);
    }
  }

  updateTimer(): void {
    if (this.timeRemaining() > 0) {
      this.timeRemaining.update((time) => Math.max(0, time - 0.016));
      this.timeSurvived.update((t) => t + 0.016);
    }
  }

  updateSpeed(): void {
    const base = 1;
    const extra = this.timeSurvived() * 0.02;
    this.speed.set(base + extra);
  }
}
