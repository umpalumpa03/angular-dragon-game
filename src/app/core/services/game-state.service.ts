import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { IObstacle } from '../models/obstacles.model';
import {
  BONUS_POINTS_PER_JUMP,
  DEFAULT_TIMER_SECONDS,
  DRAGON_HEIGHT,
  DRAGON_HITBOX_LEFT_OFFSET,
  DRAGON_HITBOX_RIGHT_OFFSET,
  DRAGON_X,
  GROUND_LEVEL,
  HIGH_SCORE_STORAGE_KEY,
  JUMP_DURATION_MS,
  JUMP_HEIGHT,
  OBSTACLE_DEFAULT_HEIGHT,
  OBSTACLE_DEFAULT_WIDTH,
  OBSTACLE_GROUND_LEVEL,
  OBSTACLE_START_X,
  SCORE_PER_TICK,
  SPEED_BASE,
  SPEED_PER_SECOND,
  TIMER_TICK_SECONDS,
} from '../models/game-config';

export type DragonState = 'running' | 'jumping' | 'falling';

@Injectable({ providedIn: 'root' })
export class GameStateService implements OnDestroy {
  public readonly isRunning = signal(false);
  public readonly isPaused = signal(true);
  public readonly isGameOver = signal(false);
  public readonly timeRemaining = signal(0);
  public readonly timeSurvived = signal(0);
  public readonly timerInputValue = signal(DEFAULT_TIMER_SECONDS);
  public readonly score = signal(0);
  public readonly highScore = signal(this.loadHighScore());
  public readonly dragonY = signal(GROUND_LEVEL);
  public readonly dragonState = signal<DragonState>('running');
  public readonly obstacles = signal<IObstacle[]>([]);

  public readonly isActive = computed(() => this.isRunning() && !this.isPaused());

  public readonly gameStatus = computed(() => {
    if (!this.isRunning()) return 'STOPPED';
    return this.isPaused() ? 'PAUSED' : 'RUNNING';
  });

  public readonly speed = computed(
    () => SPEED_BASE + this.timeSurvived() * SPEED_PER_SECOND,
  );

  public readonly canJump = computed(
    () => this.isActive() && this.dragonState() === 'running',
  );

  public readonly canPause = computed(() => this.isRunning());
  public readonly canEndGame = computed(() => this.isRunning());
  public readonly hasTimeRemaining = computed(() => this.timeRemaining() > 0);

  public readonly isNewHighScore = computed(
    () => this.isGameOver() && this.score() >= this.highScore(),
  );

  private jumpTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public ngOnDestroy(): void {
    this.clearJumpTimeout();
  }

  public startGame(): void {
    this.clearJumpTimeout();
    this.obstacles.set([]);
    this.isRunning.set(true);
    this.isPaused.set(false);
    this.isGameOver.set(false);
    this.timeRemaining.set(this.timerInputValue());
    this.timeSurvived.set(0);
    this.score.set(0);
    this.dragonState.set('running');
    this.dragonY.set(GROUND_LEVEL);
  }

  public resetGameState(): void {
    this.clearJumpTimeout();
    this.isRunning.set(false);
    this.isPaused.set(true);
    this.isGameOver.set(false);
    this.timeRemaining.set(0);
    this.timeSurvived.set(0);
    this.score.set(0);
    this.dragonY.set(GROUND_LEVEL);
    this.dragonState.set('running');
    this.obstacles.set([]);
  }

  public endGame(): void {
    this.clearJumpTimeout();
    this.isRunning.set(false);
    this.isPaused.set(true);
    this.isGameOver.set(true);
    this.persistHighScore(this.highScore());
  }

  public togglePause(): void {
    this.isPaused.update((v) => !v);
  }

  public setTimerValue(seconds: number): void {
    this.timerInputValue.set(seconds);
  }

  public jump(): void {
    if (this.dragonState() !== 'running') return;

    this.clearJumpTimeout();
    this.dragonState.set('jumping');
    this.dragonY.set(GROUND_LEVEL + JUMP_HEIGHT);

    this.jumpTimeoutId = setTimeout(() => {
      if (this.dragonState() === 'jumping') {
        this.dragonY.set(GROUND_LEVEL);
        this.dragonState.set('running');
      }
      this.jumpTimeoutId = null;
    }, JUMP_DURATION_MS);
  }

  public spawnObstacle(): void {
    const newObstacle: IObstacle = {
      x: OBSTACLE_START_X,
      width: OBSTACLE_DEFAULT_WIDTH,
      height: OBSTACLE_DEFAULT_HEIGHT,
      hasAwardedJumpBonus: false,
    };
    this.obstacles.update((list) => [...list, newObstacle]);
  }

  public moveObstacles(): void {
    const currentSpeed = this.speed();
    const currentDragonState = this.dragonState();

    this.obstacles.update((list) => {
      const result: IObstacle[] = [];

      for (const obstacle of list) {
        const newX = obstacle.x - currentSpeed;

        // Award bonus exactly once when dragon jumps OVER the obstacle
        const justPassedDragon =
          obstacle.x >= DRAGON_X && newX < DRAGON_X;

        const shouldAwardBonus =
          !obstacle.hasAwardedJumpBonus &&
          currentDragonState === 'jumping' &&
          justPassedDragon;

        if (shouldAwardBonus) {
          this.addScore(BONUS_POINTS_PER_JUMP);
        }

        // Keep obstacles that are still on screen
        if (newX > -obstacle.width) {
          result.push({
            ...obstacle,
            x: newX,
            hasAwardedJumpBonus: obstacle.hasAwardedJumpBonus || shouldAwardBonus,
          });
        }
      }

      return result;
    });
  }

  public checkCollisions(): boolean {
    // Jumping dragon is always clear of ground-level obstacles
    if (this.dragonState() === 'jumping') return false;

    const dragonBottom = this.dragonY();
    const dragonTop = dragonBottom + DRAGON_HEIGHT;
    const dragonLeft = DRAGON_X - DRAGON_HITBOX_LEFT_OFFSET;
    const dragonRight = DRAGON_X - DRAGON_HITBOX_RIGHT_OFFSET;

    for (const obstacle of this.obstacles()) {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleBottom = OBSTACLE_GROUND_LEVEL;
      const obstacleTop = obstacleBottom + obstacle.height;

      const horizontalOverlap =
        obstacleLeft < dragonRight && obstacleRight > dragonLeft;
      const verticalOverlap =
        dragonBottom < obstacleTop && dragonTop > obstacleBottom;

      if (horizontalOverlap && verticalOverlap) {
        this.endGame();
        return true;
      }
    }

    return false;
  }

  public updateScore(): void {
    if (this.isActive()) {
      this.addScore(SCORE_PER_TICK);
    }
  }

  public updateTimer(): void {
    if (!this.hasTimeRemaining()) return;

    this.timeRemaining.update((t) =>
      Math.max(0, t - TIMER_TICK_SECONDS),
    );
    this.timeSurvived.update((t) => t + TIMER_TICK_SECONDS);

    if (this.timeRemaining() <= 0 && this.isRunning()) {
      this.endGame();
    }
  }

  private addScore(points: number): void {
    this.score.update((current) => {
      const next = current + points;
      if (next > this.highScore()) {
        this.highScore.set(next);
      }
      return next;
    });
  }

  private loadHighScore(): number {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
      if (stored === null) return 0;
      const parsed = Number(stored);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    } catch {
      return 0;
    }
  }

  private persistHighScore(value: number): void {
    try {
      localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(value));
    } catch {}
  }

  private clearJumpTimeout(): void {
    if (this.jumpTimeoutId !== null) {
      clearTimeout(this.jumpTimeoutId);
      this.jumpTimeoutId = null;
    }
  }
}